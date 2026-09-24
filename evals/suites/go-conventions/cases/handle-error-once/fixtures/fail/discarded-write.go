package fixture

func Write(w io.Writer, buf []byte) {
	w.Write(buf)
}
