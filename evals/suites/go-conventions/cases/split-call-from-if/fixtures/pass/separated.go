package fixture

func separated(resp *http.Response) error {
	err := checkResponse(resp, http.StatusCreated)
	if err != nil {
		return err
	}

	return nil
}
