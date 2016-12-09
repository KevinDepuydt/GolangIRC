package chat

// Chat message
type Message struct {
	Author string `json:"author"`
	Body   string `json:"body"`
	Type   string `json:"messageType"`
	Date   int    `json:"date"`
}

func (self *Message) String() string {
	return self.Author + " says " + self.Body
}
