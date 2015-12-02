package api

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"net/http"
)

// Response - data object returned on client request
type Response struct {
	Status  string        `json:"status"`
	Data    *SnippetModel `json:"response"`
	Message string        `json:"message"`
	code    int
}

const (
	statusError = "error"
	statusOK = "ok"

	languageKey = "language"
	snippetKey = "snippet"
)

// GetSnippet - HTTP Handler gets a single code snippet from service by its id
func GetSnippet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"];

	m, err := getService().GetSnippetById(id)
	response := buildResponse(m, "Request Successful", err)
	writeJSONResponse(w, response)
}

// SaveSnippet - HTTP Handler saves a single code snippet to the database
func SaveSnippet(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		language := r.PostFormValue(languageKey)
		snippet := r.PostFormValue(snippetKey)

		if language == "" || snippet == "" {
			http.Error(w, "Missing data, language and snippet fields are required", http.StatusBadRequest)
		} else {
			newSnippet := NewSnippet(snippet, language)
			m, err := getService().CreateSnippet(newSnippet)
			response := buildResponse(m, "Snippet successfully added", err)
			writeJSONResponse(w, response)
		}

	} else {
		http.Error(w, "Endpoint only accepts post", http.StatusBadRequest)
	}
}

func buildResponse(m *SnippetModel, successMessage string, err error) (response Response) {
	if err != nil {
		response.Status = statusError
		response.Message = "Request failed with error: " + err.Error()
		response.code = http.StatusNotFound
	} else {
		response.Status = statusOK
		response.Message = successMessage
		response.Data = m
		response.code = http.StatusOK
	}
	return
}

func writeJSONResponse(w http.ResponseWriter, response Response) {
	jsonResponse, err := json.Marshal(response)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(response.code)
	w.Write(jsonResponse)
}
