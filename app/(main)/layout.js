import React from 'react'

const layout = ({children}) => {
  return (
    <div>
      <div className="w-full px-10 py-32">{children}</div>
    </div>
  )
}

export default layout
