package fixture

func Write(w io.Writer, buf []byte) error {
	_, err := w.Write(buf)
	if err != nil {
		log.Println("unable to write:", err)
		return err
	}

	return nil
}
