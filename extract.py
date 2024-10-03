import os
import zipfile
import sys


def extract_archive(filename, root):
    archive = zipfile.ZipFile(filename)
    archive.extractall(root)
    files_in_archive = archive.namelist()[0:]

    return (os.path.join(root, files_in_archive[0])).rstrip("/")


file = sys.argv[1]
dest = sys.argv[2]
extract_archive(file, dest)
