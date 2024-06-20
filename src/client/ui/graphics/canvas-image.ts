function getImage(src: string) {
  const image = new Image();
  image.src = `${location.href.replace(/\/.*\.html/, '')}/graphics/${src}`;
  return image;
}

export default getImage;