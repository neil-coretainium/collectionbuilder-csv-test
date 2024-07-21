import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { format } from '@fast-csv/format';

const csvStream = format({ headers: true });

//title,creator,date,description,subject,location,latitude,longitude,source,identifier,type,format,language,rights,rightsstatement
interface ObjectMetaData {
    identifier: string;
    objectid: string;
    parentid?: string;
    title: string;
    creator?: string;
    date?: string;
    description?: string;
    subject?: string;
    location?: string;
    latitude?: string;
    longitude?: string;
    source?: string;
    type: string;
    format: string;
    language?: string;
    rights?: string;
    rightsstatement?: string;
    object_location: string;
    image_thumb: string;
    image_small: string;
}

const objects: ObjectMetaData[] = [];

async function generateWebDerivatives(sourceDir: string) {
    const tiffFiles = await findTiffFiles(sourceDir);
    
    for (const tiffFile of tiffFiles) {
        const image = sharp(tiffFile);

        const dir = path.dirname(tiffFile);
        const ext = path.extname(tiffFile);
        const base = path.basename(tiffFile, ext);

        const objectLocation = path.join(dir, `${base}.jpg`);
        const imageThumb = path.join(dir, 'thumb', `${base}.jpg`);
        const imageSmall = path.join(dir, 'small', `${base}.jpg`);

        // need to create the thumb and small directories
        await fs.promises.mkdir(path.join(dir, 'thumb'), { recursive: true });
        await fs.promises.mkdir(path.join(dir, 'small'), { recursive: true });

        // Generate web derivative versions
        await Promise.all([
            image.clone().jpeg({ quality: 80 }).toFile(objectLocation),
            image.clone().resize(400).jpeg({ quality: 90 }).toFile(imageThumb),
            image.clone().resize(1200).jpeg({ quality: 60 }).toFile(imageSmall),
            //image.tile({ size: 256 }).toFile(getOutputPath(tiffFile, 'zoom', 'dzi'))
        ]);

        // Generate metadata
        const object: ObjectMetaData = {
            identifier: base,
            objectid: base.toLowerCase(),
            title: base,
            type: 'image',
            format: 'image/jpeg',
            object_location: objectLocation,
            image_thumb: imageThumb,
            image_small: imageSmall
        };

        csvStream.write(object);
    }

    csvStream.pipe(fs.createWriteStream('objects.csv')).on('end', () => console.log('Done writing CSV file'));
}

async function findTiffFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = async (currentDir: string) => {
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            
            if (entry.isDirectory()) {
                await scanDirectory(fullPath);
            } else if (entry.isFile() && path.extname(entry.name) === '.tif') {
                files.push(fullPath);
            }
        }
    };
    
    await scanDirectory(dir);
    
    return files;
}

// Usage
const sourceDir = '/Users/neildev/TestImages/STATIC_TEST/JS Photos';
generateWebDerivatives(sourceDir);
