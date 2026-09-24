package fixture

func selector() error {
	if err := pkg.Do(); err != nil {
		return err
	}

	return nil
}
