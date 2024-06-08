function getImage(src) {
    const image = new Image();
    image.src = `'../../../graphics/${src}`;
    return image;
}
export default getImage;
