package main

import (
	"github.com/code-wall/codebin/Godeps/_workspace/src/github.com/gorilla/csrf"
	"github.com/code-wall/codebin/Godeps/_workspace/src/github.com/gorilla/mux"
	"github.com/code-wall/codebin/api"
	"html/template"
	"net/http"
)

var conf = GetConfig()
var t = template.New("index")
var temps = template.Must(t.ParseFiles("./views/index.html"))

func main() {
	r := mux.NewRouter()

	CSRF := csrf.Protect(
		[]byte(conf.CSRFKey),
		csrf.RequestHeader("Request-Token"),
		csrf.FieldName("request_token"),
		csrf.Secure(!conf.Debug),
	)

	r.HandleFunc("/", indexHandler)
	r.PathPrefix("/dist/").Handler(createStaticHandler("/dist/", "./dist/"))
	r.HandleFunc("/save", api.SaveSnippet)
	r.HandleFunc("/snippet/{id}", api.GetSnippet)
	http.ListenAndServe(":"+conf.Port, CSRF(r))
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"token": csrf.Token(r),
	}
	temps.ExecuteTemplate(w, "index.html", data)
}

func createStaticHandler(path string, location string) http.Handler {
	serve := http.FileServer(http.Dir(location))
	return http.StripPrefix(path, serve)
}
