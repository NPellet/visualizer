$wnd.jsme.runAsyncCallback6('t(238,226,{});function H0(){H0=u;I0=new Kt("dragend",new J0)}function K0(a){a.a.cancelBubble=!0;ds(a.a)}function J0(){}t(239,238,{},J0);_.hd=function(){K0(this)};_.ld=function(){return I0};var I0;function L0(){L0=u;M0=new Kt("dragenter",new N0)}function N0(){}t(240,238,{},N0);_.hd=function(){K0(this)};_.ld=function(){return M0};var M0;function O0(){O0=u;P0=new Kt("dragover",new Q0)}function Q0(){}t(241,238,{},Q0);_.hd=function(){K0(this)};_.ld=function(){return P0};var P0;\nfunction R0(){R0=u;S0=new Kt("drop",new T0)}function T0(){}t(242,238,{},T0);_.hd=function(a){var b,c,d,e;this.a.cancelBubble=!0;ds(this.a);d=(this.a.dataTransfer||null).files;e=0;a:for(;e<d.length;++e){if(0<a.a.d&&e>=a.a.d)break a;b=d[e];c=new FileReader;U0(c,a.a.b);1==a.a.c&&c.readAsText(b)}0==d.length&&(b=(this.a.dataTransfer||null).getData(Hk),a.a.b.a.a.f.pb[fl]=null!=b?b:m)};_.ld=function(){return S0};var S0;function V0(a,b,c){Wv(!a.mb?a.mb=new kw(a):a.mb,c,b)}\nfunction W0(){this.pb=$r("file");this.pb[gg]="gwt-FileUpload"}t(359,340,Sm,W0);_.Dd=function(a){Vy(this,a)};function X0(a){var b=cs(Og);AP(wk,zP(b));this.pb=b;this.b=new VQ(this.pb);this.pb[gg]="gwt-HTML";UQ(this.b,a,!0);cR(this)}t(363,364,Sm,X0);function Y0(){uB();var a=cs("textarea");!Kx&&(Kx=new Jx);!Ix&&(Ix=new Hx);this.pb=a;this.pb[gg]="gwt-TextArea"}t(403,404,Sm,Y0);\nfunction Z0(a,b){var c,d;c=cs(Tk);d=cs(Gk);d[wf]=a.a.a;d.style[ql]=a.b.a;var e=(Mx(),Nx(d));c.appendChild(e);Lx(a.d,c);gz(a,b,d)}function $0(){aA.call(this);this.a=(dA(),kA);this.b=(lA(),oA);this.e[Uf]=Xb;this.e[Tf]=Xb}t(412,356,xm,$0);_.Yd=function(a){var b;b=bs(a.pb);(a=kz(this,a))&&this.d.removeChild(bs(b));return a};\nfunction a1(a){try{a.w=!1;var b,c,d;d=a.hb;c=a.ab;d||(a.pb.style[rl]=Ah,a.ab=!1,a.je());b=a.pb;b.style[Sh]=0+(Ms(),vj);b.style[Ok]=ac;CS(a,Bn(os($doc)+(ns()-Xr(a.pb,hj)>>1),0),Bn(ps($doc)+(ms()-Xr(a.pb,gj)>>1),0));d||((a.ab=c)?(a.pb.style[ng]=Ij,a.pb.style[rl]=sl,bn(a.gb,200)):a.pb.style[rl]=sl)}finally{a.w=!0}}function b1(a){a.i=(new OR(a.j)).Cc.Ze();Ry(a.i,new c1(a),(Qt(),Qt(),Rt));a.d=F(HB,s,47,[a.i])}\nfunction d1(){XS();var a,b,c,d,e;tT.call(this,(LT(),MT),null,!0);this.ah();this.db=!0;a=new X0(this.k);this.f=new Y0;this.f.pb.style[vl]=ic;Fy(this.f,ic);this.$g();OS(this,"400px");e=new $0;e.pb.style[zh]=ic;e.e[Uf]=10;c=(dA(),eA);e.a=c;Z0(e,a);Z0(e,this.f);this.e=new sA;this.e.e[Uf]=20;for(b=this.d,c=0,d=b.length;c<d;++c)a=b[c],pA(this.e,a);Z0(e,this.e);bT(this,e);XR(this,!1);this._g()}t(696,697,AO,d1);_.$g=function(){b1(this)};\n_._g=function(){var a=this.f;a.pb.readOnly=!0;var b=Iy(a.pb)+"-readonly";Ey(a.Ld(),b,!0)};_.ah=function(){WR(this.I.b,"Copy")};_.d=null;_.e=null;_.f=null;_.i=null;_.j="Close";_.k="Press Ctrl-C (Command-C on Mac) or right click (Option-click on Mac) on the selected text to copy it, then paste into another program.";function c1(a){this.a=a}t(699,1,{},c1);_.od=function(){dT(this.a,!1)};_.a=null;function e1(a){this.a=a}t(700,1,{},e1);\n_.Vc=function(){Ny(this.a.f.pb,!0);MA(this.a.f.pb);var a=this.a.f,b;b=Yr(a.pb,fl).length;if(0<b&&a.kb){if(0>b)throw new QK("Length must be a positive integer. Length: "+b);if(b>Yr(a.pb,fl).length)throw new QK("From Index: 0  To Index: "+b+"  Text Length: "+Yr(a.pb,fl).length);var a=a.pb,c=0;try{var d=a.createTextRange(),e=a.value.substr(c,b).match(/(\\r\\n)/gi);null!=e&&(b-=e.length);var f=a.value.substring(0,c).match(/(\\r\\n)/gi);null!=f&&(c-=f.length);d.collapse(!0);d.moveStart("character",c);d.moveEnd("character",\nb);d.select()}catch(g){}}};_.a=null;function f1(a){b1(a);a.a=(new OR(a.b)).Cc.Ze();Ry(a.a,new i1(a),(Qt(),Qt(),Rt));a.d=F(HB,s,47,[a.a,a.i])}function j1(a){a.j="Cancel";a.k="Paste the text to import into the text area below.";a.b="Accept";WR(a.I.b,"Paste")}function k1(a){XS();d1.call(this);this.c=a}t(702,696,AO,k1);_.$g=function(){f1(this)};_._g=function(){Fy(this.f,"150px")};_.ah=function(){j1(this)};_.je=function(){sT(this);Mr((Jr(),Kr),new l1(this))};_.a=null;_.b=null;_.c=null;\nfunction m1(a){XS();k1.call(this,a)}t(701,702,AO,m1);_.$g=function(){var a;f1(this);a=new W0;Ry(a,new n1(this),(NP(),NP(),OP));this.d=F(HB,s,47,[this.a,a,this.i])};_._g=function(){Fy(this.f,"150px");var a=new o1(this),b=this.f;V0(b,new p1,(L0(),L0(),M0));V0(b,new q1,(H0(),H0(),I0));V0(b,new r1,(O0(),O0(),P0));V0(b,new s1(a),(R0(),R0(),S0))};_.ah=function(){j1(this);this.k+=" Or drag and drop a file on it."};function n1(a){this.a=a}t(703,1,{},n1);\n_.nd=function(a){var b,c;b=new FileReader;a=(c=a.a.srcElement,c.files[0]);t1(b,new u1(this));b.readAsText(a)};_.a=null;function u1(a){this.a=a}t(704,1,{},u1);_.bh=function(a){oF();tB(this.a.a.f,a)};_.a=null;t(707,1,{});t(706,707,{});_.b=null;_.c=1;_.d=-1;function o1(a){this.a=a;this.b=new v1(this);this.c=this.d=1}t(705,706,{},o1);_.a=null;function v1(a){this.a=a}t(708,1,{},v1);_.bh=function(a){this.a.a.f.pb[fl]=null!=a?a:m};_.a=null;function i1(a){this.a=a}t(712,1,{},i1);\n_.od=function(){if(this.a.c){var a=this.a.c,b;b=new jF(a.a,0,Yr(this.a.f.pb,fl));wJ(a.a.a,b.a)}dT(this.a,!1)};_.a=null;function l1(a){this.a=a}t(713,1,{},l1);_.Vc=function(){Ny(this.a.f.pb,!0);MA(this.a.f.pb)};_.a=null;t(714,1,mm);_.ed=function(){var a,b;a=new w1(this.a);void 0!=$wnd.FileReader?b=new m1(a):b=new k1(a);QS(b);a1(b)};function w1(a){this.a=a}t(715,1,{},w1);_.a=null;t(716,1,mm);\n_.ed=function(){var a;a=new d1;var b=this.a,c;tB(a.f,b);b=(c=YK(b,"\\r\\n|\\r|\\n|\\n\\r"),c.length);Fy(a.f,20*(10>b?b:10)+vj);Mr((Jr(),Kr),new e1(a));QS(a);a1(a)};function t1(a,b){a.onload=function(a){b.bh(a.target.result)}}function U0(a,b){a.onloadend=function(a){b.bh(a.target.result)}}function s1(a){this.a=a}t(721,1,{},s1);_.a=null;function p1(){}t(722,1,{},p1);function q1(){}t(723,1,{},q1);function r1(){}t(724,1,{},r1);T(707);T(706);T(721);T(722);T(723);T(724);T(238);T(240);T(239);T(241);T(242);T(696);\nT(702);T(701);T(715);T(699);T(700);T(712);T(713);T(703);T(704);T(705);T(708);T(363);T(412);T(403);T(359);v(yO)(6);\n//@ sourceURL=6.js\n')