package main

import (
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
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	indexTmpl.Execute(w, gdata)
}

func main() {
	http.HandleFunc("/", homeHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	log.Fatal(http.ListenAndServe(":8080", nil))
}