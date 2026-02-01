import Image from 'next/image'

const AvatarImage = ({ image, initials, alt, size }) => {
  if (!image) {
    return (
      <div className={`${size} bg-muted flex items-center justify-center rounded-full`}>
        <span className="text-xs font-medium">{initials}</span>
      </div>
    )
  }

  return (
    <div className="rounded-sm">
      <Image
        src={image}
        width={500}
        height={500}
        alt={alt}
        noindex="true"
        className={`${size} rounded-full object-cover`}
      />
    </div>
  )
}

export default AvatarImage
