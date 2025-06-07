'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/app/lib/utils'

interface JShineLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  className?: string
  external?: boolean
  children: React.ReactNode
}

// Parse markdown style link format [text](url)
export function parseMarkdownLink(text: string): { text: string, links: { text: string, url: string }[] } {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const links: { text: string, url: string }[] = []
  let lastIndex = 0
  let result = ''
  
  let match
  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    result += text.substring(lastIndex, match.index)
    
    // Save the link info
    links.push({
      text: match[1],
      url: match[2]
    })
    
    // Add a placeholder for the link
    result += `[LINK_${links.length - 1}]`
    
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  result += text.substring(lastIndex)
  
  return { text: result, links }
}

// Component to render text with JShine links
export function RenderWithJShineLinks({ text }: { text: string }) {
  const { text: parsedText, links } = parseMarkdownLink(text)
  
  if (links.length === 0) {
    return <>{text}</>
  }
  
  const parts = parsedText.split(/\[LINK_(\d+)\]/)
  
  return (
    <>
      {parts.map((part, i) => {
        // Even indices are regular text
        if (i % 2 === 0) {
          return part
        } else {
          // Odd indices are link indices
          const linkIndex = parseInt(part, 10)
          const link = links[linkIndex]
          return (
            <JShineLink key={i} href={link.url}>
              {link.text}
            </JShineLink>
          )
        }
      })}
    </>
  )
}

const JShineLink = ({
  href,
  className,
  external = false,
  children,
  ...props
}: JShineLinkProps) => {
  const linkClass = cn('jshine-gradient', className)
  
  if (external || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return (
      <a 
        href={href}
        className={linkClass}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    )
  }
  
  return (
    <Link 
      href={href}
      className={linkClass}
      {...props}
    >
      {children}
    </Link>
  )
}

export { JShineLink } 