package main

import (
	"errors"
	"log"
	"math"

	"encoding/json"
	"html/template"
	"io/ioutil"
	"net/http"
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

func indexToCoords(i int) (int, int, error) {
	// TODO: Probably don't want to be doing this every time (causes uneeded error)
	gdata, err := loadGridData()
	if err != nil {
		return -1, -1, err
	}
	x := i % gdata.Width
	y := i / gdata.Width
	return x, y, nil
}

// I stole this drawing code from: https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
func plotLineLow(x0, y0, x1, y1 int) [][]int {
	ret := [][]int{}

    dx := x1 - x0
    dy := y1 - y0
    yi := 1
    if dy < 0 {
        yi = -1
        dy = -dy
	}
    D := (2 * dy) - dx
    y := y0

    for x := x0; x <= x1; x++ {
		ret = append(ret, []int{x,y})
        if D > 0 {
			y = y + yi
            D = D + (2 * (dy - dx))
		} else {
			D = D + 2*dy
		}
	}

	return ret
}

func plotLineHigh(x0, y0, x1, y1 int) [][]int {
	ret := [][]int{}

    dx := x1 - x0
    dy := y1 - y0
    xi := 1
    if dx < 0 {
		xi = -1
        dx = -dx
	}
    D := (2 * dx) - dy
    x := x0

    for y := y0; y <= y1; y++ {
		ret = append(ret, []int{x,y})
        if D > 0 {
			x = x + xi
            D = D + (2 * (dx - dy))
		} else {
			D = D + 2*dx
		}
	}

	return ret
}

func bresenham(x0, y0, x1, y1 int) [][]int {
	if math.Abs(float64(y1 - y0)) < math.Abs(float64(x1 - x0)) {
		if x0 > x1 {
			return plotLineLow(x1, y1, x0, y0)
		} else {
			return plotLineLow(x0, y0, x1, y1)
		}
	}
	return plotLineHigh(x0, y0, x1, y1)
}

func drawLine(indicies []int, rgbCode []int) ([]byte, error)  {
	var x0, y0, x1, y1 int
	if (indicies[0] < indicies[1]) {
		x0, y0, _ = indexToCoords(indicies[0])
		x1, y1, _ = indexToCoords(indicies[1])
	} else {
		x0, y0, _ = indexToCoords(indicies[1])
		x1, y1, _ = indexToCoords(indicies[0])
	}
	points := bresenham(x0, y0, x1, y1)


	// TODO: DEFINITELY don't want to be doing this every time (causes uneeded error)
	gdata, err := loadGridData()
	if err != nil {
		return nil, err
	}

	var newGrid []byte
	for _, pt := range points {
		pi := pt[0] + pt[1] * gdata.Width
		newGrid, err = changePixelData(pi, rgbCode)
		if err != nil {
			return nil, err
		}
	}

	return newGrid, nil
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
		newGrid, err = drawLine(m.PixelIds, m.RgbCode)
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