package main

import (
	"log"
	"net/http"

	"./chat"
	"fmt"
	"os"
	"io"
	"strconv"
)

const uploadDir = "web/uploads/"

func uploadHandler(w http.ResponseWriter, r *http.Request) {

	file, header, err := r.FormFile("file")

	if err != nil {
		fmt.Fprintln(w, err)
		return
	}

	defer file.Close()

	// get file name
	filename := header.Filename

	// check if file already exist
	if _, err := os.Stat(uploadDir + filename); err == nil {
		fileExist := true
		i := 0
		for fileExist {
			// then change filename
			log.Println("change filename try " + strconv.Itoa(i + 1))
			temp := strconv.Itoa(i) + "-" + filename
			if _, err := os.Stat(uploadDir + temp); os.IsNotExist(err) {
				fileExist = false
				filename = temp
			}
			i += 1
		}
	}

	uploadPath := uploadDir + filename
	out, err := os.Create(uploadPath)
	if err != nil {
		log.Println("Unable to create the file for writing. Check your write access privilege")
		fmt.Fprintf(w, "Error, unable to save file")
		return
	}

	defer out.Close()

	// write the content from POST to the file
	_, err = io.Copy(out, file)
	if err != nil {
		fmt.Fprintln(w, err)
	}

	log.Println("File uploaded successfully!")
	fmt.Fprintf(w, filename)
}

func main() {
	log.SetFlags(log.Lshortfile)

	// websocket server
	server := chat.NewServer("/chat")
	go server.Listen()

	// static files
	http.Handle("/", http.FileServer(http.Dir("web")))

	// uploads
	http.HandleFunc("/upload", uploadHandler);

	log.Fatal(http.ListenAndServe(":8080", nil))
}
