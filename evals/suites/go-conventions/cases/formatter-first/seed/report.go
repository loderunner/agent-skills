package report

import (
"strings"
	"fmt"
  "sort"
	"time"
)

type Entry struct {
	Name string
	  Count int
	Seen  time.Time
}

func Summarize( entries []Entry ) string {
sort.Slice(entries, func(i, j int) bool {
			return entries[i].Count>entries[j].Count
	})

	var b strings.Builder
	for _,e := range entries {
	    fmt.Fprintf(&b, "%s: %d (last seen %s)\n", e.Name, e.Count , e.Seen.Format(time.RFC3339))
	}
		return b.String()
}

func Total(entries []Entry) int {
	total:=0
	for _, e := range entries {
total += e.Count
	}
	return total
}
