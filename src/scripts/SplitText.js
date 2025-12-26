// VERSION: 0.6.1
// DATE: 2018-08-27
// UPDATES AND DOCS AT: http://greensock.com
//
// @license Copyright (c) 2008-2018, GreenSock. All rights reserved.
// SplitText is a Club GreenSock membership benefit; You must have a valid membership to use
// this code without violating the terms of use. Visit http://greensock.com/club/ to sign up or get more details.
// This work is subject to the software agreement that was issued with your membership.
//
// @author: Jack Doyle, jack@greensock.com

var _gsScope = (typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window; //helps ensure compatibility with AMD/RequireJS and CommonJS/Node
(function(e) {
        var t = e.GreenSockGlobals || e
            , a = function(e) {
            var a, n = e.split("."), s = t;
            for (a = 0; a < n.length; a++)
                s[n[a]] = s = s[n[a]] || {};
            return s
        }
            , n = a("com.greensock.utils")
            , s = function e(t) {
            var a = t.nodeType
                , n = "";
            if (1 === a || 9 === a || 11 === a) {
                if ("string" === typeof t.textContent)
                    return t.textContent;
                for (t = t.firstChild; t; t = t.nextSibling)
                    n += e(t)
            } else if (3 === a || 4 === a)
                return t.nodeValue;
            return n
        }
            , r = document
            , i = r.defaultView ? r.defaultView.getComputedStyle : function() {}
            , o = /([A-Z])/g
            , l = function(e, t, a, n) {
            var s;
            return (a = a || i(e, null)) ? (e = a.getPropertyValue(t.replace(o, "-$1").toLowerCase()),
                s = e || a.length ? e : a[t]) : e.currentStyle && (a = e.currentStyle,
                s = a[t]),
                n ? s : parseInt(s, 10) || 0
        }
            , c = function(e) {
            return !!(e.length && e[0] && (e[0].nodeType && e[0].style && !e.nodeType || e[0].length && e[0][0]))
        }
            , u = function(e) {
            var t, a, n, s = [], r = e.length;
            for (t = 0; t < r; t++)
                if (a = e[t],
                    c(a))
                    for (n = a.length,
                             n = 0; n < a.length; n++)
                        s.push(a[n]);
                else
                    s.push(a);
            return s
        }
            , d = function(e, t) {
            var a, n = t.length;
            while (--n > -1)
                if (a = t[n],
                e.substr(0, a.length) === a)
                    return a.length
        }
            , p = /(?:\r|\n|\t\t)/g
            , h = /(?:\s\s+)/g
            , m = 55296
            , f = 56319
            , v = 56320
            , _ = 127462
            , g = 127487
            , b = 127995
            , y = 127999
            , S = function(e) {
            return (e.charCodeAt(0) - m << 10) + (e.charCodeAt(1) - v) + 65536
        }
            , C = r.all && !r.addEventListener
            , E = " style='position:relative;display:inline-block;" + (C ? "*display:inline;*zoom:1;'" : "'")
            , w = function(e, t) {
            e = e || "";
            var a = -1 !== e.indexOf("++")
                , n = 1;
            return a && (e = e.split("++").join("")),
                function() {
                    return "<" + t + E + (e ? " class='" + e + (a ? n++ : "") + "'>" : ">")
                }
        }
            , I = n.SplitText = t.SplitText = function(e, t) {
            if ("string" === typeof e && (e = I.selector(e)),
                !e)
                throw "cannot split a null element.";
            this.elements = c(e) ? u(e) : [e],
                this.chars = [],
                this.words = [],
                this.lines = [],
                this._originals = [],
                this.vars = t || {},
                this.split(t)
        }
            , O = function e(t, a, n) {
            var s = t.nodeType;
            if (1 === s || 9 === s || 11 === s)
                for (t = t.firstChild; t; t = t.nextSibling)
                    e(t, a, n);
            else
                3 !== s && 4 !== s || (t.nodeValue = t.nodeValue.split(a).join(n))
        }
            , A = function(e, t) {
            var a = t.length;
            while (--a > -1)
                e.push(t[a])
        }
            , $ = function(e) {
            var t, a = [], n = e.length;
            for (t = 0; t !== n; a.push(e[t++]))
                ;
            return a
        }
            , x = function(e, t, a) {
            var n;
            while (e && e !== t) {
                if (n = e._next || e.nextSibling,
                    n)
                    return n.textContent.charAt(0) === a;
                e = e.parentNode || e._parent
            }
            return !1
        }
            , T = function e(t) {
            var a, n, s = $(t.childNodes), r = s.length;
            for (a = 0; a < r; a++)
                n = s[a],
                    n._isSplit ? e(n) : (a && 3 === n.previousSibling.nodeType ? n.previousSibling.nodeValue += 3 === n.nodeType ? n.nodeValue : n.firstChild.nodeValue : 3 !== n.nodeType && t.insertBefore(n.firstChild, n),
                        t.removeChild(n))
        }
            , L = function(e, t, a, n, s, o, c) {
            var u, d, p, h, m, f, v, _, g, b, y, S, C = i(e), E = l(e, "paddingLeft", C), w = -999, I = l(e, "borderBottomWidth", C) + l(e, "borderTopWidth", C), $ = l(e, "borderLeftWidth", C) + l(e, "borderRightWidth", C), L = l(e, "paddingTop", C) + l(e, "paddingBottom", C), k = l(e, "paddingLeft", C) + l(e, "paddingRight", C), P = .2 * l(e, "fontSize"), D = l(e, "textAlign", C, !0), R = [], N = [], q = [], j = t.wordDelimiter || " ", M = t.span ? "span" : "div", H = t.type || t.split || "chars,words,lines", F = s && -1 !== H.indexOf("lines") ? [] : null, B = -1 !== H.indexOf("words"), z = -1 !== H.indexOf("chars"), G = "absolute" === t.position || !0 === t.absolute, Y = t.linesClass, U = -1 !== (Y || "").indexOf("++"), V = [];
            for (U && (Y = Y.split("++").join("")),
                     d = e.getElementsByTagName("*"),
                     p = d.length,
                     m = [],
                     u = 0; u < p; u++)
                m[u] = d[u];
            if (F || G)
                for (u = 0; u < p; u++)
                    h = m[u],
                        f = h.parentNode === e,
                    (f || G || z && !B) && (S = h.offsetTop,
                    F && f && Math.abs(S - w) > P && ("BR" !== h.nodeName || 0 === u) && (v = [],
                        F.push(v),
                        w = S),
                    G && (h._x = h.offsetLeft,
                        h._y = S,
                        h._w = h.offsetWidth,
                        h._h = h.offsetHeight),
                    F && ((h._isSplit && f || !z && f || B && f || !B && h.parentNode.parentNode === e && !h.parentNode._isSplit) && (v.push(h),
                        h._x -= E,
                    x(h, e, j) && (h._wordEnd = !0)),
                    "BR" === h.nodeName && (h.nextSibling && "BR" === h.nextSibling.nodeName || 0 === u) && F.push([])));
            for (u = 0; u < p; u++)
                h = m[u],
                    f = h.parentNode === e,
                    "BR" !== h.nodeName ? (G && (g = h.style,
                    B || f || (h._x += h.parentNode._x,
                        h._y += h.parentNode._y),
                        g.left = h._x + "px",
                        g.top = h._y + "px",
                        g.position = "absolute",
                        g.display = "block",
                        g.width = h._w + 1 + "px",
                        g.height = h._h + "px"),
                        !B && z ? h._isSplit ? (h._next = h.nextSibling,
                            h.parentNode.appendChild(h)) : h.parentNode._isSplit ? (h._parent = h.parentNode,
                        !h.previousSibling && h.firstChild && (h.firstChild._isFirst = !0),
                        h.nextSibling && " " === h.nextSibling.textContent && !h.nextSibling.nextSibling && V.push(h.nextSibling),
                            h._next = h.nextSibling && h.nextSibling._isFirst ? null : h.nextSibling,
                            h.parentNode.removeChild(h),
                            m.splice(u--, 1),
                            p--) : f || (S = !h.nextSibling && x(h.parentNode, e, j),
                        h.parentNode._parent && h.parentNode._parent.appendChild(h),
                        S && h.parentNode.appendChild(r.createTextNode(" ")),
                        t.span && (h.style.display = "inline"),
                            R.push(h)) : h.parentNode._isSplit && !h._isSplit && "" !== h.innerHTML ? N.push(h) : z && !h._isSplit && (t.span && (h.style.display = "inline"),
                            R.push(h))) : F || G ? (h.parentNode && h.parentNode.removeChild(h),
                        m.splice(u--, 1),
                        p--) : B || e.appendChild(h);
            u = V.length;
            while (--u > -1)
                V[u].parentNode.removeChild(V[u]);
            if (F) {
                G && (b = r.createElement(M),
                    e.appendChild(b),
                    y = b.offsetWidth + "px",
                    S = b.offsetParent === e ? 0 : e.offsetLeft,
                    e.removeChild(b)),
                    g = e.style.cssText,
                    e.style.cssText = "display:none;";
                while (e.firstChild)
                    e.removeChild(e.firstChild);
                for (_ = " " === j && (!G || !B && !z),
                         u = 0; u < F.length; u++) {
                    for (v = F[u],
                             b = r.createElement(M),
                             b.style.cssText = "display:block;text-align:" + D + ";position:" + (G ? "absolute;" : "relative;"),
                         Y && (b.className = Y + (U ? u + 1 : "")),
                             q.push(b),
                             p = v.length,
                             d = 0; d < p; d++)
                        "BR" !== v[d].nodeName && (h = v[d],
                            b.appendChild(h),
                        _ && h._wordEnd && b.appendChild(r.createTextNode(" ")),
                        G && (0 === d && (b.style.top = h._y + "px",
                            b.style.left = E + S + "px"),
                            h.style.top = "0px",
                        S && (h.style.left = h._x - S + "px")));
                    0 === p ? b.innerHTML = "&nbsp;" : B || z || (T(b),
                        O(b, String.fromCharCode(160), " ")),
                    G && (b.style.width = y,
                        b.style.height = h._h + "px"),
                        e.appendChild(b)
                }
                e.style.cssText = g
            }
            G && (c > e.clientHeight && (e.style.height = c - L + "px",
            e.clientHeight < c && (e.style.height = c + I + "px")),
            o > e.clientWidth && (e.style.width = o - k + "px",
            e.clientWidth < o && (e.style.width = o + $ + "px"))),
                A(a, R),
                A(n, N),
                A(s, q)
        }
            , k = function(e, t, a, n) {
            var i, o, l, c, u, v, C, E, w, I, A = t.span ? "span" : "div", $ = t.type || t.split || "chars,words,lines", x = -1 !== $.indexOf("chars"), T = "absolute" === t.position || !0 === t.absolute, L = t.wordDelimiter || " ", k = " " !== L ? "" : T ? "&#173; " : " ", P = t.span ? "</span>" : "</div>", D = !0, R = t.specialChars ? "function" === typeof t.specialChars ? t.specialChars : d : null, N = r.createElement("div"), q = e.parentNode;
            for (q.insertBefore(N, e),
                     N.textContent = e.nodeValue,
                     q.removeChild(e),
                     e = N,
                     i = s(e),
                     C = -1 !== i.indexOf("<"),
                 !1 !== t.reduceWhiteSpace && (i = i.replace(h, " ").replace(p, "")),
                 C && (i = i.split("<").join("{{LT}}")),
                     u = i.length,
                     o = (" " === i.charAt(0) ? k : "") + a(),
                     l = 0; l < u; l++)
                if (v = i.charAt(l),
                R && (I = R(i.substr(l), t.specialChars)))
                    v = i.substr(l, I || 1),
                        o += x && " " !== v ? n() + v + "</" + A + ">" : v,
                        l += I - 1;
                else if (v === L && i.charAt(l - 1) !== L && l) {
                    o += D ? P : "",
                        D = !1;
                    while (i.charAt(l + 1) === L)
                        o += k,
                            l++;
                    l === u - 1 ? o += k : ")" !== i.charAt(l + 1) && (o += k + a(),
                        D = !0)
                } else
                    "{" === v && "{{LT}}" === i.substr(l, 6) ? (o += x ? n() + "{{LT}}</" + A + ">" : "{{LT}}",
                        l += 5) : v.charCodeAt(0) >= m && v.charCodeAt(0) <= f || i.charCodeAt(l + 1) >= 65024 && i.charCodeAt(l + 1) <= 65039 ? (E = S(i.substr(l, 2)),
                        w = S(i.substr(l + 2, 2)),
                        c = E >= _ && E <= g && w >= _ && w <= g || w >= b && w <= y ? 4 : 2,
                        o += x && " " !== v ? n() + i.substr(l, c) + "</" + A + ">" : i.substr(l, c),
                        l += c - 1) : o += x && " " !== v ? n() + v + "</" + A + ">" : v;
            e.outerHTML = o + (D ? P : ""),
            C && O(q, "{{LT}}", "<")
        }
            , P = function e(t, a, n, s) {
            var r, i, o = $(t.childNodes), c = o.length, u = "absolute" === a.position || !0 === a.absolute;
            if (3 !== t.nodeType || c > 1) {
                for (a.absolute = !1,
                         r = 0; r < c; r++)
                    i = o[r],
                    (3 !== i.nodeType || /\S+/.test(i.nodeValue)) && (u && 3 !== i.nodeType && "inline" === l(i, "display", null, !0) && (i.style.display = "inline-block",
                        i.style.position = "relative"),
                        i._isSplit = !0,
                        e(i, a, n, s));
                return a.absolute = u,
                    void (t._isSplit = !0)
            }
            k(t, a, n, s)
        }
            , D = I.prototype;
        D.split = function(e) {
            this.isSplit && this.revert(),
                this.vars = e = e || this.vars,
                this._originals.length = this.chars.length = this.words.length = this.lines.length = 0;
            var t, a, n, s = this.elements.length, r = e.span ? "span" : "div", i = w(e.wordsClass, r), o = w(e.charsClass, r);
            while (--s > -1)
                n = this.elements[s],
                    this._originals[s] = n.innerHTML,
                    t = n.clientHeight,
                    a = n.clientWidth,
                    P(n, e, i, o),
                    L(n, e, this.chars, this.words, this.lines, a, t);
            return this.chars.reverse(),
                this.words.reverse(),
                this.lines.reverse(),
                this.isSplit = !0,
                this
        }
            ,
            D.revert = function() {
                if (!this._originals)
                    throw "revert() call wasn't scoped properly.";
                var e = this._originals.length;
                while (--e > -1)
                    this.elements[e].innerHTML = this._originals[e];
                return this.chars = [],
                    this.words = [],
                    this.lines = [],
                    this.isSplit = !1,
                    this
            }
            ,
            I.selector = e.$ || e.jQuery || function(t) {
                var a = e.$ || e.jQuery;
                return a ? (I.selector = a,
                    a(t)) : "undefined" === typeof document ? t : document.querySelectorAll ? document.querySelectorAll(t) : document.getElementById("#" === t.charAt(0) ? t.substr(1) : t)
            }
            ,
            I.version = "0.6.1"
    }
)(_gsScope);

//export to AMD/RequireJS and CommonJS/Node (precursor to full modular build system coming at a later date)
(function(name) {
    "use strict";
    var getGlobal = function() {
        return (_gsScope.GreenSockGlobals || _gsScope)[name];
    };
    if (typeof(module) !== "undefined" && module.exports) { //node
        module.exports = getGlobal();
    } else if (typeof(define) === "function" && define.amd) { //AMD
        define([], getGlobal);
    }
}("SplitText"));
