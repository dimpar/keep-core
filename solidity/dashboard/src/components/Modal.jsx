import React, { useEffect, useRef } from "react"
import ReactDOM from "react-dom"
import * as Icons from "./Icons"

const modalRoot = document.getElementById('modal-root')
const crossIconHeight = 15
const crossIconWidth = 15

const Modal = React.memo(({ closeModal, ...props }) => {
  const modalOverlay = useRef(null)
  useEffect(() => {
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = "scroll"
    }
  }, [])

  const onOverlayClick = (event) => {
    if (modalOverlay.current === event.target) {
      closeModal()
    }
  }

  return ReactDOM.createPortal(
    <div ref={modalOverlay} className="modal-overlay" onClick={onOverlayClick}>
      <div className="modal-wrapper">
        <div className="modal-title">
          <h4 className="text-darker-grey">{props.title}</h4>
          <div className="modal-close" onClick={closeModal}>
            <Icons.Cross width={crossIconWidth} height={crossIconHeight} />
          </div>
        </div>
        <div className="modal-content">
          {props.children}
        </div>
      </div>
    </div>,
    modalRoot
  )
})

export default Modal
