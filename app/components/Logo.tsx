import Image from 'next/image'

export default function Logo() {
  return (
    <div className="w-20 h-20 rounded-full bg-[#f0f3fa] flex items-center justify-center mb-8 shadow-[inset_8px_8px_16px_#d1d9e6,inset_-8px_-8px_16px_#ffffff]">
      <Image
        src="/kat-logo.png"
        alt="The Leadership Development App"
        width={80}
        height={84}
        className="object-contain"
      />
    </div>
  )
}
