export default function TruePowerLogo({ size = 40 }) {
  return (
    <img
      src="/logo.png"
      alt="TruePower"
      style={{ width: size, height: size, objectFit: 'contain' }}
      className="max-w-full max-h-full"
    />
  )
}
