import XCTest
import SwiftTreeSitter
import TreeSitterBitBake

final class TreeSitterBitBakeTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_bitbake())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading BitBake grammar")
    }
}
