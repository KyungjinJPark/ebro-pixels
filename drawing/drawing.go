package drawing

import (
	"math"
)

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
	} else {
		if y0 > y1 {
			return plotLineHigh(x1, y1, x0, y0)
		} else {
			return plotLineHigh(x0, y0, x1, y1)
		}
	}
}

func CalcLinePixels(coords [][]int, rgbCode []int) ([][]int, error)  {
	lineCoords := bresenham(coords[0][0], coords[0][1], coords[1][0], coords[1][1])
	return lineCoords, nil
}