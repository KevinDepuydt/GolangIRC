package main

import (
	"log"
	"net/http"

	"./chat"
	"./upload"
)

func main() {
	log.SetFlags(log.Lshortfile)

	// websocket server
	server := chat.NewServer("/chat")
	go server.Listen()

	// static files
	http.Handle("/", http.FileServer(http.Dir("web")))

	// uploads
	http.HandleFunc("/upload", upload.UploadHandler)

	log.Fatal(http.ListenAndServe(":8080", nil))
}
