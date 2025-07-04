const Notification = ({ message }) => {
    const content = message.content
    const type = message.type

    if (message === null) {
        return null
    }

    if (type === "info") {
         return (
        <div className="info">
          {content}
        </div>
    )
    }

    if (type === "error") {
        return (
        <div className="error">
          {content}
        </div>
    )
    }
}

export default Notification