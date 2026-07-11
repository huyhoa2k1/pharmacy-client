const CLOUDINARY_CLOUD_NAME = 'dohuyhoa'
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`

const encodePublicId = (publicId: string) =>
  publicId
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

export const getCloudinaryImageUrl = (publicId: string, transform = 'f_auto,q_auto') => {
  if (!publicId) return ''
  return `${CLOUDINARY_BASE_URL}/${transform}/${encodePublicId(publicId)}`
}
