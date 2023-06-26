async function isImage(value, filename) {
let extension = (path.extname(filename)).toLowerCase();
switch (extension) {
    case '.jpg':
        return '.jpg';
    case '.jpeg':
        return '.jpeg';
    case  '.png':
        return '.png';
    default:
        return false;
}
}