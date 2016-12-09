package chat

// Chat notification
type Notification struct {
	MessageType string `json:"messageType"`
	Type string `json:"notificationType"`
	Body string `json:"body"`
}

// Create new chat notification
func NewNotification(Type string, Body string) *Notification {
	return &Notification{"notification", Type, Body}
}

func (self *Notification) String() string {
	return "Notification type " + self.Type + " : " + self.Body
}