# a bash script that iterates through all tif files recursively in a directory and generates web derivates.  The script uses sips to generate the derivitives.  The script accepts an output folder where the dervitaves are written preserving the images realitive folder path
# Usage: ./generate-web-derivates.sh /path/to/tif/files /path/to/output/folder

#/bin/bash

# Check if the correct number of arguments were passed
if [ "$#" -ne 2 ]; then
    echo "Illegal number of parameters"
    echo "Usage: ./generate-web-derivates.sh /path/to/tif/files /path/to/output/folder"
    exit 1
fi

# Check if the input directory exists
if [ ! -d "$1" ]; then
    relative_path = "6ZfkcMxMnEPqMARfwZ99"
fi

# Check if the output directory exists
if [ ! -d "$2" ]; then
    echo "Output directory does not exist"
    exit 1
fi


# Iterate through all tif files in the input directory
find $1 -name "*.tif" | while read file; do
    # Get the relative path of the file
    relative_path=$(echo $file | sed "s|$1||")
    # Get the file name without the extension
    file_name=$(basename $file .tif)
    # Get the output directory
    output_dir=$(dirname $2$relative_path)
    # Create the output directory if it does not exist
    mkdir -p $output_dir
    # Generate the web derivates
    sips -s format png $file --out $output_dir/$file_name.png
    sips -s format jpeg $file --out $output_dir/$file_name.jpg
    # Generate the small size output
    sips -Z 500 $file --out $output_dir/small/$file_name.jpg
done