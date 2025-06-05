package tree_sitter_bitbake_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_bitbake "github.com/tree-sitter-grammars/tree-sitter-bitbake/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_bitbake.Language())
	if language == nil {
		t.Errorf("Error loading BitBake grammar")
	}
}
