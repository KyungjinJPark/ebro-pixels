package main

import (
	"log"

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
	jsonBlob, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, err
	}
	var gdata gridData
	err = json.Unmarshal(jsonBlob, &gdata)
	if err != nil {
		return nil, err
	}
	return &gdata, nil
}


func saveGridData(gdata *gridData) ([]byte, error) {
	filename := "data/grid.json"
	data, err := json.Marshal(gdata)
	if err != nil {
		return nil, err
	}
	ioutil.WriteFile(filename, data, 0600)
	return data, nil
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
func changePixelData(index int) ([]byte, error) {
	gdata, err := loadGridData()
	if err != nil {
		return nil, err
	}

	if gdata.Pixels[index] == 1 {
		gdata.Pixels[index] = 0
	} else {
		gdata.Pixels[index] = 1
	}
	
	data, err := saveGridData(gdata)
	if err != nil {
		return nil, err
	}
	return data, nil
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

	newGrid, err := changePixelData(m.PixelId)
	if err != nil {
		log.Printf("Error saving grid data: %v", err)
		http.Error(w, "can't save grid data", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK) // 200
	// WARN: Content-Length header automatically added b/c newGrid is under a few kilobytes
	_, err = w.Write(newGrid)
}

func main() {
	http.HandleFunc("/edit/", editPixelHandler)
	http.HandleFunc("/", homeHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	log.Fatal(http.ListenAndServe(":8080", nil))
}