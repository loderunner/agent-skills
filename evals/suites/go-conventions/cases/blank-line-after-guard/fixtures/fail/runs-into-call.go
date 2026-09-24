package fixture

func runsIntoCall(r io.Reader, buf []byte) error {
	for {
		n, err := r.Read(buf)
		if err != nil {
			return err
		}
		process(buf[:n])
	}
}
