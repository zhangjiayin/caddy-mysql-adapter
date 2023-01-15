package mysqladapter

import (
	"fmt"
	"os"
	"testing"

	mysqladapter "github.com/zhangjiayin/caddy-mysql-adapter"
)

func TestCaddyMySQLAdapter(t *testing.T)  {
    // msg, err := Hello("Gladys")
	adapter := mysqladapter.Adapter{}
	data, ferr := os.ReadFile("./mysql.json")
	if (ferr != nil) {
 		t.Fatalf("read file mysql.json failed %v", ferr)
	}
	b,w,e := adapter.Adapt(data,nil)
	message := fmt.Sprintf("b : %v,w: %v,e: %v\n", b,w,e)
	if e != nil {
       t.Fatalf("adapter  err  %v", e)
    }
	t.Logf("Adapt: %s", message)
}
