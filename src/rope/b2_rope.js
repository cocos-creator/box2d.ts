/*
* Copyright (c) 2011 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/
System.register(["../common/b2_settings.js", "../common/b2_math.js", "../common/b2_draw.js"], function (exports_1, context_1) {
    "use strict";
    var b2_settings_js_1, b2_math_js_1, b2_draw_js_1, b2RopeDef, b2Rope;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (b2_settings_js_1_1) {
                b2_settings_js_1 = b2_settings_js_1_1;
            },
            function (b2_math_js_1_1) {
                b2_math_js_1 = b2_math_js_1_1;
            },
            function (b2_draw_js_1_1) {
                b2_draw_js_1 = b2_draw_js_1_1;
            }
        ],
        execute: function () {
            ///
            b2RopeDef = class b2RopeDef {
                constructor() {
                    ///
                    this.vertices = [];
                    ///
                    this.count = 0;
                    ///
                    this.masses = [];
                    ///
                    this.gravity = new b2_math_js_1.b2Vec2(0, 0);
                    ///
                    this.damping = 0.1;
                    /// Stretching stiffness
                    this.k2 = 0.9;
                    /// Bending stiffness. Values above 0.5 can make the simulation blow up.
                    this.k3 = 0.1;
                }
            };
            exports_1("b2RopeDef", b2RopeDef);
            ///
            b2Rope = class b2Rope {
                constructor() {
                    this.m_count = 0;
                    this.m_ps = [];
                    this.m_p0s = [];
                    this.m_vs = [];
                    this.m_ims = [];
                    this.m_Ls = [];
                    this.m_as = [];
                    this.m_gravity = new b2_math_js_1.b2Vec2();
                    this.m_damping = 0;
                    this.m_k2 = 1;
                    this.m_k3 = 0.1;
                }
                GetVertexCount() {
                    return this.m_count;
                }
                GetVertices() {
                    return this.m_ps;
                }
                ///
                Initialize(def) {
                    // DEBUG: b2Assert(def.count >= 3);
                    this.m_count = def.count;
                    // this.m_ps = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
                    this.m_ps = b2_math_js_1.b2Vec2.MakeArray(this.m_count);
                    // this.m_p0s = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
                    this.m_p0s = b2_math_js_1.b2Vec2.MakeArray(this.m_count);
                    // this.m_vs = (b2Vec2*)b2Alloc(this.m_count * sizeof(b2Vec2));
                    this.m_vs = b2_math_js_1.b2Vec2.MakeArray(this.m_count);
                    // this.m_ims = (float32*)b2Alloc(this.m_count * sizeof(float32));
                    this.m_ims = b2_settings_js_1.b2MakeNumberArray(this.m_count);
                    for (let i = 0; i < this.m_count; ++i) {
                        this.m_ps[i].Copy(def.vertices[i]);
                        this.m_p0s[i].Copy(def.vertices[i]);
                        this.m_vs[i].SetZero();
                        const m = def.masses[i];
                        if (m > 0) {
                            this.m_ims[i] = 1 / m;
                        }
                        else {
                            this.m_ims[i] = 0;
                        }
                    }
                    const count2 = this.m_count - 1;
                    const count3 = this.m_count - 2;
                    // this.m_Ls = (float32*)be2Alloc(count2 * sizeof(float32));
                    this.m_Ls = b2_settings_js_1.b2MakeNumberArray(count2);
                    // this.m_as = (float32*)b2Alloc(count3 * sizeof(float32));
                    this.m_as = b2_settings_js_1.b2MakeNumberArray(count3);
                    for (let i = 0; i < count2; ++i) {
                        const p1 = this.m_ps[i];
                        const p2 = this.m_ps[i + 1];
                        this.m_Ls[i] = b2_math_js_1.b2Vec2.DistanceVV(p1, p2);
                    }
                    for (let i = 0; i < count3; ++i) {
                        const p1 = this.m_ps[i];
                        const p2 = this.m_ps[i + 1];
                        const p3 = this.m_ps[i + 2];
                        const d1 = b2_math_js_1.b2Vec2.SubVV(p2, p1, b2_math_js_1.b2Vec2.s_t0);
                        const d2 = b2_math_js_1.b2Vec2.SubVV(p3, p2, b2_math_js_1.b2Vec2.s_t1);
                        const a = b2_math_js_1.b2Vec2.CrossVV(d1, d2);
                        const b = b2_math_js_1.b2Vec2.DotVV(d1, d2);
                        this.m_as[i] = b2_math_js_1.b2Atan2(a, b);
                    }
                    this.m_gravity.Copy(def.gravity);
                    this.m_damping = def.damping;
                    this.m_k2 = def.k2;
                    this.m_k3 = def.k3;
                }
                ///
                Step(h, iterations) {
                    if (h === 0) {
                        return;
                    }
                    const d = Math.exp(-h * this.m_damping);
                    for (let i = 0; i < this.m_count; ++i) {
                        this.m_p0s[i].Copy(this.m_ps[i]);
                        if (this.m_ims[i] > 0) {
                            this.m_vs[i].SelfMulAdd(h, this.m_gravity);
                        }
                        this.m_vs[i].SelfMul(d);
                        this.m_ps[i].SelfMulAdd(h, this.m_vs[i]);
                    }
                    for (let i = 0; i < iterations; ++i) {
                        this.SolveC2();
                        this.SolveC3();
                        this.SolveC2();
                    }
                    const inv_h = 1 / h;
                    for (let i = 0; i < this.m_count; ++i) {
                        b2_math_js_1.b2Vec2.MulSV(inv_h, b2_math_js_1.b2Vec2.SubVV(this.m_ps[i], this.m_p0s[i], b2_math_js_1.b2Vec2.s_t0), this.m_vs[i]);
                    }
                }
                SolveC2() {
                    const count2 = this.m_count - 1;
                    for (let i = 0; i < count2; ++i) {
                        const p1 = this.m_ps[i];
                        const p2 = this.m_ps[i + 1];
                        const d = b2_math_js_1.b2Vec2.SubVV(p2, p1, b2Rope.s_d);
                        const L = d.Normalize();
                        const im1 = this.m_ims[i];
                        const im2 = this.m_ims[i + 1];
                        if (im1 + im2 === 0) {
                            continue;
                        }
                        const s1 = im1 / (im1 + im2);
                        const s2 = im2 / (im1 + im2);
                        p1.SelfMulSub(this.m_k2 * s1 * (this.m_Ls[i] - L), d);
                        p2.SelfMulAdd(this.m_k2 * s2 * (this.m_Ls[i] - L), d);
                        // this.m_ps[i] = p1;
                        // this.m_ps[i + 1] = p2;
                    }
                }
                SetAngle(angle) {
                    const count3 = this.m_count - 2;
                    for (let i = 0; i < count3; ++i) {
                        this.m_as[i] = angle;
                    }
                }
                SolveC3() {
                    const count3 = this.m_count - 2;
                    for (let i = 0; i < count3; ++i) {
                        const p1 = this.m_ps[i];
                        const p2 = this.m_ps[i + 1];
                        const p3 = this.m_ps[i + 2];
                        const m1 = this.m_ims[i];
                        const m2 = this.m_ims[i + 1];
                        const m3 = this.m_ims[i + 2];
                        const d1 = b2_math_js_1.b2Vec2.SubVV(p2, p1, b2Rope.s_d1);
                        const d2 = b2_math_js_1.b2Vec2.SubVV(p3, p2, b2Rope.s_d2);
                        const L1sqr = d1.LengthSquared();
                        const L2sqr = d2.LengthSquared();
                        if (L1sqr * L2sqr === 0) {
                            continue;
                        }
                        const a = b2_math_js_1.b2Vec2.CrossVV(d1, d2);
                        const b = b2_math_js_1.b2Vec2.DotVV(d1, d2);
                        let angle = b2_math_js_1.b2Atan2(a, b);
                        const Jd1 = b2_math_js_1.b2Vec2.MulSV((-1 / L1sqr), d1.SelfSkew(), b2Rope.s_Jd1);
                        const Jd2 = b2_math_js_1.b2Vec2.MulSV((1 / L2sqr), d2.SelfSkew(), b2Rope.s_Jd2);
                        const J1 = b2_math_js_1.b2Vec2.NegV(Jd1, b2Rope.s_J1);
                        const J2 = b2_math_js_1.b2Vec2.SubVV(Jd1, Jd2, b2Rope.s_J2);
                        const J3 = Jd2;
                        let mass = m1 * b2_math_js_1.b2Vec2.DotVV(J1, J1) + m2 * b2_math_js_1.b2Vec2.DotVV(J2, J2) + m3 * b2_math_js_1.b2Vec2.DotVV(J3, J3);
                        if (mass === 0) {
                            continue;
                        }
                        mass = 1 / mass;
                        let C = angle - this.m_as[i];
                        while (C > b2_settings_js_1.b2_pi) {
                            angle -= 2 * b2_settings_js_1.b2_pi;
                            C = angle - this.m_as[i];
                        }
                        while (C < -b2_settings_js_1.b2_pi) {
                            angle += 2 * b2_settings_js_1.b2_pi;
                            C = angle - this.m_as[i];
                        }
                        const impulse = -this.m_k3 * mass * C;
                        p1.SelfMulAdd((m1 * impulse), J1);
                        p2.SelfMulAdd((m2 * impulse), J2);
                        p3.SelfMulAdd((m3 * impulse), J3);
                        // this.m_ps[i] = p1;
                        // this.m_ps[i + 1] = p2;
                        // this.m_ps[i + 2] = p3;
                    }
                }
                Draw(draw) {
                    const c = new b2_draw_js_1.b2Color(0.4, 0.5, 0.7);
                    for (let i = 0; i < this.m_count - 1; ++i) {
                        draw.DrawSegment(this.m_ps[i], this.m_ps[i + 1], c);
                    }
                }
            };
            exports_1("b2Rope", b2Rope);
            ///
            b2Rope.s_d = new b2_math_js_1.b2Vec2();
            b2Rope.s_d1 = new b2_math_js_1.b2Vec2();
            b2Rope.s_d2 = new b2_math_js_1.b2Vec2();
            b2Rope.s_Jd1 = new b2_math_js_1.b2Vec2();
            b2Rope.s_Jd2 = new b2_math_js_1.b2Vec2();
            b2Rope.s_J1 = new b2_math_js_1.b2Vec2();
            b2Rope.s_J2 = new b2_math_js_1.b2Vec2();
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYjJfcm9wZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImIyX3JvcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUFnQkU7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQU9GLEdBQUc7WUFDSCxZQUFBLE1BQWEsU0FBUztnQkFBdEI7b0JBQ0UsR0FBRztvQkFDSSxhQUFRLEdBQWEsRUFBRSxDQUFDO29CQUUvQixHQUFHO29CQUNJLFVBQUssR0FBVyxDQUFDLENBQUM7b0JBRXpCLEdBQUc7b0JBQ0ksV0FBTSxHQUFhLEVBQUUsQ0FBQztvQkFFN0IsR0FBRztvQkFDYSxZQUFPLEdBQVcsSUFBSSxtQkFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFFbkQsR0FBRztvQkFDSSxZQUFPLEdBQVcsR0FBRyxDQUFDO29CQUU3Qix3QkFBd0I7b0JBQ2pCLE9BQUUsR0FBVyxHQUFHLENBQUM7b0JBRXhCLHdFQUF3RTtvQkFDakUsT0FBRSxHQUFXLEdBQUcsQ0FBQztnQkFDMUIsQ0FBQzthQUFBLENBQUE7O1lBRUQsR0FBRztZQUNILFNBQUEsTUFBYSxNQUFNO2dCQUFuQjtvQkFDUyxZQUFPLEdBQVcsQ0FBQyxDQUFDO29CQUNwQixTQUFJLEdBQWEsRUFBRSxDQUFDO29CQUNwQixVQUFLLEdBQWEsRUFBRSxDQUFDO29CQUNyQixTQUFJLEdBQWEsRUFBRSxDQUFDO29CQUVwQixVQUFLLEdBQWEsRUFBRSxDQUFDO29CQUVyQixTQUFJLEdBQWEsRUFBRSxDQUFDO29CQUNwQixTQUFJLEdBQWEsRUFBRSxDQUFDO29CQUVYLGNBQVMsR0FBVyxJQUFJLG1CQUFNLEVBQUUsQ0FBQztvQkFDMUMsY0FBUyxHQUFXLENBQUMsQ0FBQztvQkFFdEIsU0FBSSxHQUFXLENBQUMsQ0FBQztvQkFDakIsU0FBSSxHQUFXLEdBQUcsQ0FBQztnQkFxTjVCLENBQUM7Z0JBbk5RLGNBQWM7b0JBQ25CLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FB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