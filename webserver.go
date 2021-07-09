package main

import (
	"fmt"
	"io"
	"log"
	"strings"

	"encoding/json"
	"html/template"
	"io/ioutil"
	"net/http"
)

type gridData struct {
	Width  int
	Height int
	Pixels []int
}

// Loads grid dimensions and pixel information
// Code stolen from golang json docs
func loadGridData() (*gridData, error) {
	filename := "data/grid.json"
	gridBytes, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	// TODO: change this to Unmarshal
	dec := json.NewDecoder(strings.NewReader(string(gridBytes)))
	var gdata gridData
	if err := dec.Decode(&gdata); err == io.EOF {
		//
	} else if err != nil {
		return nil, err
	}
	return &gdata, nil
}

var indexTmpl = template.Must(template.ParseFiles("index.html"))

func homeHandler(w http.ResponseWriter, r *http.Request) {
	gdata, err := loadGridData()
	if err != nil {
		log.Printf("Error leading grid data: %v", err)
		http.Error(w, "can't load grid data", http.StatusInternalServerError)
		return
	}
	indexTmpl.Execute(w, gdata)
}

// Loads grid dimensions and pixel information
// Code stolen from golang json docs
func savePixelData(index int) error {
	// Get data
	filename := "data/grid.json"
	jsonBlob, err := ioutil.ReadFile(filename)
	if err != nil {
		return err
	}
	var gdata gridData
	err = json.Unmarshal(jsonBlob, &gdata)
	if err != nil {
		return err
	}

	if gdata.Pixels[index] == 1 {
		gdata.Pixels[index] = 0
	} else {
		gdata.Pixels[index] = 1
	}
	
	// Write out
	data, err := json.Marshal(gdata)
	if err != nil {
		return err
	}
	ioutil.WriteFile(filename, data, 0600)
	return nil
}

func editPixelHandler(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
		http.Error(w, "can't read body", http.StatusBadRequest)
		return
	}
	
	// May want to make this a seperate function 
	type message struct {
		PixelId int
	}
	var m message
	err = json.Unmarshal(body, &m)
	if err != nil {
		log.Printf("Error decoding body: %v", err)
		http.Error(w, "can't read body", http.StatusBadRequest)
		return
	}

	err = savePixelData(m.PixelId)
	if err != nil {
		log.Printf("Error saving grid data: %v", err)
		http.Error(w, "can't save grid data", http.StatusInternalServerError)
		return
	}
	fmt.Fprintf(w, "Success!")
}

func main() {
	http.HandleFunc("/edit/", editPixelHandler)
	http.HandleFunc("/", homeHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	log.Fatal(http.ListenAndServe(":8080", nil))
}