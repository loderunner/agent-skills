package fixture

func inline(resp *http.Response) error {
	if err := checkResponse(resp, http.StatusCreated); err != nil {
		return err
	}

	return nil
}
