package main

import (
	"errors"
	"log"

	"encoding/json"
	"html/template"
	"io/ioutil"
	"net/http"

	"github.com/KyungjinJPark/pixels-for-friends/drawing"
)

type gridData struct {
	Width  int
	Height int
	Pixels [][]int
}

// Loads grid dimensions and pixel information
// Code stolen from golang json docs
func loadGridData() (*gridData, error) {
	filename := "data/grid.json"
	jsonBlob, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, errors.New(err.Error() + " ON ReadFile")
	}
	var gdata gridData
	err = json.Unmarshal(jsonBlob, &gdata)
	if err != nil {
		return nil, errors.New(err.Error() + " ON Unmarshal") // 2 fast error
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
	// TODO: Not sure if I want to be doing this every time
	gdata, err := loadGridData()
	if err != nil {
		log.Printf("Error reading grid data: %v", err)
		http.Error(w, "can't load grid data", http.StatusInternalServerError)
		return
	}
	indexTmpl.Execute(w, gdata)
}

// Loads grid dimensions and pixel information
// Code stolen from golang json docs
func changePixelData(index int, rgbCode []int) ([]byte, error) {
	if index < 0 || len(rgbCode) != 3 {
		return nil, errors.New("negative index or wrong number of rgb values")
	}
	gdata, err := loadGridData()
	if err != nil {
		return nil, errors.New(err.Error() + " ON loadGridData")
	}
	if index >= len(gdata.Pixels) {
		return nil, errors.New("slice index out of bounds")
	}
	gdata.Pixels[index] = rgbCode
	data, err := saveGridData(gdata)
	if err != nil {
		return nil, errors.New(err.Error() + " ON saveGridData")
	}
	return data, nil
}

func indexToCoords(i int) ([]int, error) {
	// TODO: Probably don't want to be doing this every time (causes uneeded error)
	gdata, err := loadGridData()
	if err != nil {
		return nil, err
	}
	x := i % gdata.Width
	y := i / gdata.Width
	return []int{x, y}, nil
}

func coordsToIndex(coord []int) (int, error) {
	// TODO: Probably don't want to be doing this every time (causes uneeded error)
	gdata, err := loadGridData()
	if err != nil {
		return -1, err
	}
	return coord[0] + coord[1] * gdata.Width, nil
}

func editPixelHandler(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
		http.Error(w, "can't read body", http.StatusBadRequest)
		return
	}
	
	type message struct {
		Tool     string
		PixelIds []int
		RgbCode  []int
	}
	var m message
	err = json.Unmarshal(body, &m)
	if err != nil {
		log.Printf("Error decoding body: %v", err)
		http.Error(w, "can't read body", http.StatusBadRequest)
		return
	}

	var newGrid []byte
	switch m.Tool {
	case "point":
		newGrid, err = changePixelData(m.PixelIds[0], m.RgbCode)
	case "line": 
		c1, _ := indexToCoords(m.PixelIds[0]) // TODO: These errors shouldn't be here for long
		c2, _ := indexToCoords(m.PixelIds[0])
		coords, err := drawing.CalcLinePixels([][]int{c1, c2}, m.RgbCode)
		if err == nil {
			for _, coord := range coords {
				i, _ := coordsToIndex(coord)
				newGrid, err = changePixelData(i, m.RgbCode)
			}
		}
	}
	if err != nil {
		log.Printf("Error saving grid data: %v", err)
		http.Error(w, "can't save grid data", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK) // 200
	// WARN: Content-Length header automatically added b/c newGrid is under a few kilobytes
	_, err = w.Write(newGrid)
}


func getGridHandler(w http.ResponseWriter, r *http.Request) {
	filename := "data/grid.json"
	jsonBlob, err := ioutil.ReadFile(filename)
	if err != nil {
		if err != nil {
			log.Printf("Error reading grid data: %v", err)
			http.Error(w, "can't get grid data", http.StatusInternalServerError)
			return
		}
	}
	w.WriteHeader(http.StatusOK) // 200
	// WARN: Content-Length header automatically added b/c newGrid is under a few kilobytes
	_, err = w.Write(jsonBlob)
}

func main() {
	http.HandleFunc("/edit/", editPixelHandler)
	http.HandleFunc("/get/", getGridHandler)
	http.HandleFunc("/", homeHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	log.Printf("Listening on port %s", ":8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}