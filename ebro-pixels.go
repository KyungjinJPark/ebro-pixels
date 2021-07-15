package main

import (
	"errors"
	"log"

	"encoding/json"
	"html/template"
	"io/ioutil"
	"net/http"

	"github.com/KyungjinJPark/ebro-pixels/drawing"
)

type gridData struct {
	Width  int
	Height int
	Pixels [][]int
}

var GRID_FILENAME string = "data/grid.json"

// A global state that only stores grid dimensions. Loaded on server launch
var dimensions = panicLoadDimensions(loadGridData())
func panicLoadDimensions(gd *gridData, err error) *gridData {
	if err != nil {
		panic("oh no")
	}
	return gd
}

// Loads grid dimensions and pixel information
// Code stolen from golang json docs
func loadGridJson() ([]byte, error) {
	jsonBlob, err := ioutil.ReadFile(GRID_FILENAME)
	if err != nil {
		return nil, err
	}
	return jsonBlob, nil
}
func loadGridData() (*gridData, error) {
	jsonBlob, err := loadGridJson()
	if err != nil {
		return nil, errors.New(err.Error() + " ON ReadFile")
	}
	var gdata gridData
	if err = json.Unmarshal(jsonBlob, &gdata); err != nil {
		return nil, errors.New(err.Error() + " ON Unmarshal") // 2 fast error
	}
	return &gdata, nil
}

func saveGridData(gdata *gridData) ([]byte, error) {
	data, err := json.Marshal(gdata)
	if err != nil {
		return nil, err
	}
	ioutil.WriteFile(GRID_FILENAME, data, 0600)
	return data, nil
}

func respError(w http.ResponseWriter, errmsg string, err error, code int) {
	log.Printf("%s: %v", errmsg, err)
	http.Error(w, errmsg, code)
}

func getGridHandler(w http.ResponseWriter, r *http.Request) {
	jsonBlob, err := loadGridJson()
	if err != nil {
		respError(w, "Error loading grid data", err, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK) // 200
	// WARN: Content-Length header automatically added b/c newGrid is under a few kilobytes
	if _, err = w.Write(jsonBlob); err != nil {
		respError(w, "Error writing response", err, http.StatusInternalServerError)
		return
	}
}

var indexTmpl = template.Must(template.ParseFiles("index.html"))

func homeHandler(w http.ResponseWriter, r *http.Request) {
	// TODO: Not sure if I want to be doing this every time
	gdata, err := loadGridData()
	if err != nil {
		respError(w, "Error loading grid data", err, http.StatusInternalServerError)
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

func indexToCoords(i int) ([]int) {
	return []int{i % dimensions.Width, i / dimensions.Width}
}
func coordsToIndex(coord []int) (int) {
	return coord[0] + coord[1] * dimensions.Width
}

func editPixelHandler(w http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		respError(w, "Error reading request body", err, http.StatusBadRequest)
	}
	
	type message struct {
		Tool     string
		PixelIds []int
		RgbCode  []int
	}
	var m message
	if err = json.Unmarshal(body, &m); err != nil {
		respError(w, "Error decoding request body", err, http.StatusBadRequest)
		return
	}

	var newGrid []byte
	switch m.Tool {
	case "point":
		newGrid, err = changePixelData(m.PixelIds[0], m.RgbCode)
	case "line": 
		c1 := indexToCoords(m.PixelIds[0])
		c2 := indexToCoords(m.PixelIds[1])
		coords := drawing.CalcLinePixels([][]int{c1, c2})
			for _, coord := range coords {
				i := coordsToIndex(coord)
				newGrid, err = changePixelData(i, m.RgbCode)
				if err != nil {
					break
				}
			}
	case "triangle": 
		c1 := indexToCoords(m.PixelIds[0])
		c2 := indexToCoords(m.PixelIds[1])
		c3 := indexToCoords(m.PixelIds[2])
		cha := make(chan []int, 10)
		go drawing.CalcTrianglePixels([][]int{c1, c2, c3}, cha)
		for coord := range cha {
			i := coordsToIndex(coord)
			newGrid, err = changePixelData(i, m.RgbCode)
			if err != nil {
				break
			}
		}
	}
	if err != nil {
		respError(w, "Error saving grid data", err, http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK) // 200
	// WARN: Content-Length header automatically added b/c newGrid is under a few kilobytes
	if _, err = w.Write(newGrid); err != nil {
		respError(w, "Error writing response", err, http.StatusInternalServerError)
		return
	}
}

func main() {
	http.HandleFunc("/get/", getGridHandler)
	http.HandleFunc("/edit/", editPixelHandler)
	http.HandleFunc("/", homeHandler)
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	log.Printf("Listening on port %s", ":8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}