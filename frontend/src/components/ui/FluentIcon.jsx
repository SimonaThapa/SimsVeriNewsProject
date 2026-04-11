// components/ui/FluentIcon.jsx
import React from 'react'

const ICON_MAP = {
  shield:  '🛡️',
  robot:   '🤖',
  star:    '⭐',
  check:   '✅',
  cross:   '❌',
  warning: '⚠️',
  trophy:  '🏆',
  target:  '🎯',
  fire:    '🔥',
  search:  '🔍',
  books:   '📚',
  chart:   '📊',
  graph:   '📈',
  bell:    '🔔',
  newspaper: '📰',
  user:    '👤',
  trash:   '🗑️',
  bulb:    '💡',
  link:    '🔗',
  memo:    '📝',
  party:   '🎉',
  rocket:  '🚀',
  game:    '🎮',
  medal:   '🏅',
  sparkles: '✨',
  brain:   '🧠',
  info:    'ℹ️',
  refresh: '🔄',
  cancel:  '✖️',
  plus:    '➕',
  megaphone: '📢',
  send:    '📤',
  chat:    '💬',
  hand:    '✌️',
  video:   '📹',
  play:    '▶️',
}

export default function FluentIcon({ name, size = 24, className = '', style = {} }) {
  const emoji = ICON_MAP[name] || '❓'
  return (
    <img 
      src={`https://emojicdn.elk.sh/${emoji}?style=apple`}
      alt={name}
      className={`fluent-icon ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style
      }}
    />
  )
}
