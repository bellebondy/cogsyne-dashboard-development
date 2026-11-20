type FranklinAvatarProps = {
  className?: string
  decorative?: boolean
}

export function FranklinAvatar({ className, decorative = true }: FranklinAvatarProps) {
  return (
    <svg
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : "Franklin the turtle"}
      className={className}
      fill="none"
      role={decorative ? undefined : "img"}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="18" cy="47" rx="7" ry="5.3" fill="#85C5D8" />
      <ellipse cx="40" cy="49" rx="7" ry="5.2" fill="#85C5D8" />
      <ellipse cx="13" cy="27" rx="6.3" ry="5.5" fill="#A5D2E0" />
      <ellipse cx="38" cy="28" rx="6.5" ry="5.4" fill="#A5D2E0" />
      <path d="M13.5 35.8c0-11.1 8.1-19.2 19-19.2 9.1 0 15.3 6.6 15.3 15.4v8.1c0 5.1-4.4 8.6-10.2 8.6H23.8c-6 0-10.3-4.5-10.3-12.9Z" fill="#DCEEF3" />
      <path d="M13.2 34.2c.6-12.1 9.5-20.9 22-20.9 11.3 0 18.7 7.9 18.7 18.9 0 10.5-7 17.2-17.8 17.2H25.7c-7.6 0-12.5-6.1-12.5-15.2Z" fill="#07539B" />
      <path d="M21.7 31.1c1.5-7.2 6.3-11.4 13.1-11.4 6.6 0 11.2 4 12.1 10.4-3.3 1.8-6.1 4.5-7.8 8.1H26.5c-2.2-2.1-3.8-4.5-4.8-7.1Z" fill="#3E91B8" />
      <path d="M35 20.3c-1.2 4.1-1.2 8.1 0 11.8m-11.8-2.9c3.9 1 7.5 1.9 11.8 1.9 4.1 0 7.8-.7 11.7-2" stroke="#78BDD1" strokeLinecap="round" strokeWidth="1.7" />
      <path d="M22 37.5c2.8-1.5 5.4-2.2 8-2.1 3.7.1 6.2 1.6 9.7 1.6 2.7 0 5.2-.9 7.1-2.5" stroke="#00B8C8" strokeLinecap="round" strokeWidth="2.1" />
      <path d="M43.2 15.2c0-6.2 4.6-10.3 10.3-10.3 5.6 0 9.5 4.2 9.5 9.8 0 6-4 10.8-10.1 10.8-5.9 0-9.7-4.2-9.7-10.3Z" fill="#DCEEF3" />
      <ellipse cx="50.1" cy="14.8" rx="1.35" ry="2.2" fill="#062B63" />
      <ellipse cx="57.1" cy="14.8" rx="1.35" ry="2.2" fill="#062B63" />
      <circle cx="50.5" cy="14" r=".55" fill="white" />
      <circle cx="57.5" cy="14" r=".55" fill="white" />
      <path d="M51.8 19.2c1.6 1.7 3.5 1.7 5.1 0" stroke="#07539B" strokeLinecap="round" strokeWidth="1.35" />
      <circle cx="47.1" cy="18.4" r="1.4" fill="#7FCDD8" fillOpacity=".72" />
      <circle cx="60.1" cy="18.4" r="1.4" fill="#7FCDD8" fillOpacity=".72" />
    </svg>
  )
}
