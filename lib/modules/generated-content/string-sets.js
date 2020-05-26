"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _handler = _interopRequireDefault(require("../handler"));

var _cssTree = _interopRequireDefault(require("css-tree"));

var _css = require("../../utils/css");

function _createSuper(Derived) { return function () { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

var StringSets = /*#__PURE__*/function (_Handler) {
  (0, _inherits2["default"])(StringSets, _Handler);

  var _super = _createSuper(StringSets);

  function StringSets(chunker, polisher, caller) {
    var _this;

    (0, _classCallCheck2["default"])(this, StringSets);
    _this = _super.call(this, chunker, polisher, caller);
    _this.stringSetSelectors = {};
    _this.type; // pageLastString = last string variable defined on the page 

    _this.pageLastString;
    return _this;
  }

  (0, _createClass2["default"])(StringSets, [{
    key: "onDeclaration",
    value: function onDeclaration(declaration, dItem, dList, rule) {
      if (declaration.property === "string-set") {
        var selector = _cssTree["default"].generate(rule.ruleNode.prelude);

        var identifier = declaration.value.children.first().name;
        var value;

        _cssTree["default"].walk(declaration, {
          visit: "Function",
          enter: function enter(node, item, list) {
            value = _cssTree["default"].generate(node);
          }
        });

        this.stringSetSelectors[identifier] = {
          identifier: identifier,
          value: value,
          selector: selector
        };
      }
    }
  }, {
    key: "onContent",
    value: function onContent(funcNode, fItem, fList, declaration, rule) {
      if (funcNode.name === "string") {
        var identifier = funcNode.children && funcNode.children.first().name;
        this.type = funcNode.children.last().name;
        funcNode.name = "var";
        funcNode.children = new _cssTree["default"].List();
        funcNode.children.append(funcNode.children.createItem({
          type: "Identifier",
          loc: null,
          name: "--pagedjs-string-" + identifier
        }));
      }
    }
  }, {
    key: "afterPageLayout",
    value: function afterPageLayout(fragment) {
      var _this2 = this;

      if (this.pageLastString === undefined) {
        this.pageLastString = {};
      } // get the value of the previous last string


      var _loop = function _loop() {
        var name = _Object$keys[_i];
        var set = _this2.stringSetSelectors[name];
        var selected = fragment.querySelectorAll(set.selector); // let cssVar = previousPageLastString;
        // Get the last found string for the current identifier

        var cssVar = name in _this2.pageLastString ? _this2.pageLastString[name] : "";
        selected.forEach(function (sel) {
          // push each content into the array to define in the variable the first and the last element of the page.
          //this.pageLastString = selected[selected.length - 1].textContent;
          // Index by identifier
          _this2.pageLastString[name] = selected[selected.length - 1].textContent;

          if (_this2.type === "first") {
            cssVar = selected[0].textContent;
          } else if (_this2.type === "last") {
            cssVar = selected[selected.length - 1].textContent;
          } else if (_this2.type === "start") {
            if (sel.parentElement.firstChild === sel) {
              cssVar = sel.textContent;
            }
          } else if (_this2.type === "first-except") {
            cssVar = "";
          } else {
            cssVar = selected[0].textContent;
          }
        });
        fragment.setAttribute("data-string", "string-type-".concat(_this2.type, "-").concat(name)); // fragment.style.setProperty(`--pagedjs-string-${name}`, `"${cssVar.replace(/\\([\s\S])|(["|'])/g, "\\$1$2")}"`);

        fragment.style.setProperty("--pagedjs-string-".concat(name), "\"".concat((0, _css.cleanPseudoContent)(cssVar))); // if there is no new string on the page

        if (!fragment.hasAttribute("data-string")) {
          fragment.style.setProperty("--pagedjs-string-".concat(name), "\"".concat(_this2.pageLastString, "\""));
        }
      };

      for (var _i = 0, _Object$keys = Object.keys(this.stringSetSelectors); _i < _Object$keys.length; _i++) {
        _loop();
      }
    }
  }]);
  return StringSets;
}(_handler["default"]);

var _default = StringSets;
exports["default"] = _default;