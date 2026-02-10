# Math Equations Test - v3.5

Testing inline and block equations with KaTeX/LaTeX syntax.

---

## 1. Basic Inline Equations

The Pythagorean theorem: $$a^2 + b^2 = c^2$$

Einstein's famous equation: $$E = mc^2$$

A simple fraction: $$\frac{1}{2}$$

---

## 2. Basic Block Equations

$$
x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}
$$

The quadratic formula above shows the solution to $$ax^2 + bx + c = 0$$.

---

## 3. Superscripts and Subscripts

- Inline superscript: $$x^2$$, $$e^{i\pi}$$, $$2^{10} = 1024$$
- Inline subscript: $$x_1$$, $$a_n$$, $$H_2O$$
- Combined: $$x_1^2 + x_2^2 = r^2$$

---

## 4. Greek Letters

Common Greek letters: $$\alpha$$, $$\beta$$, $$\gamma$$, $$\delta$$, $$\pi$$, $$\sigma$$, $$\omega$$

Uppercase: $$\Gamma$$, $$\Delta$$, $$\Sigma$$, $$\Omega$$

In equations: $$\theta = \arctan(\frac{y}{x})$$

---

## 5. Fractions and Roots

Simple fraction: $$\frac{a}{b}$$

Nested fractions: $$\frac{1}{1 + \frac{1}{2}}$$

Square root: $$\sqrt{2}$$, $$\sqrt{x^2 + y^2}$$

Nth root: $$\sqrt[3]{27} = 3$$

---

## 6. Summations and Products

Sum notation: $$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$

Product notation: $$\prod_{i=1}^{n} i = n!$$

Infinite sum: $$\sum_{n=0}^{\infty} \frac{1}{2^n} = 2$$

---

## 7. Integrals and Derivatives

Derivative: $$\frac{d}{dx}(x^2) = 2x$$

Partial derivative: $$\frac{\partial f}{\partial x}$$

Integral: $$\int_{0}^{1} x^2 dx = \frac{1}{3}$$

Definite integral:
$$
\int_{a}^{b} f(x) dx = F(b) - F(a)
$$

---

## 8. Matrices

2x2 matrix inline: $$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$$

Block matrix:
$$
A = \begin{bmatrix}
1 & 2 & 3 \\
4 & 5 & 6 \\
7 & 8 & 9
\end{bmatrix}
$$

---

## 9. Systems of Equations

$$
\begin{cases}
x + y = 5 \\
2x - y = 1
\end{cases}
$$

Solution: $$x = 2$$, $$y = 3$$

---

## 10. Trigonometry

Basic trig: $$\sin(\theta)$$, $$\cos(\theta)$$, $$\tan(\theta)$$

Identity: $$\sin^2(\theta) + \cos^2(\theta) = 1$$

Euler's formula:
$$
e^{i\theta} = \cos(\theta) + i\sin(\theta)
$$

---

## 11. Limits

Inline limit: $$\lim_{x \to 0} \frac{\sin(x)}{x} = 1$$

Block limit:
$$
\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e
$$

---

## 12. Vectors and Norms

Vector: $$\vec{v} = \langle x, y, z \rangle$$

Magnitude: $$|\vec{v}| = \sqrt{x^2 + y^2 + z^2}$$

Dot product: $$\vec{a} \cdot \vec{b} = a_1b_1 + a_2b_2 + a_3b_3$$

---

## 13. Set Theory

Set notation: $$\{x \in \mathbb{R} : x > 0\}$$

Union and intersection: $$A \cup B$$, $$A \cap B$$

Subset: $$A \subseteq B$$

Empty set: $$\emptyset$$

---

## 14. Logic Symbols

Logical AND: $$p \land q$$

Logical OR: $$p \lor q$$

Negation: $$\neg p$$

Implies: $$p \Rightarrow q$$

If and only if: $$p \Leftrightarrow q$$

For all: $$\forall x \in X$$

There exists: $$\exists x \in X$$

---

## 15. Special Functions

Absolute value: $$|x|$$

Floor: $$\lfloor x \rfloor$$

Ceiling: $$\lceil x \rceil$$

Factorial: $$n!$$

Binomial: $$\binom{n}{k} = \frac{n!}{k!(n-k)!}$$

---

## 16. Complex Equations

The normal distribution:
$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}
$$

Fourier transform:
$$
F(\omega) = \int_{-\infty}^{\infty} f(t) e^{-i\omega t} dt
$$

---

## 17. Equations with Text

The area of a circle is $$A = \pi r^2$$ where $$r$$ is the radius.

The volume of a sphere:
$$
V = \frac{4}{3}\pi r^3
$$

---

## 18. Multiple Equations in One Paragraph

In physics, we have Newton's second law $$F = ma$$, kinetic energy $$KE = \frac{1}{2}mv^2$$, and potential energy $$PE = mgh$$. Combined, these give us conservation of energy: $$KE + PE = \text{constant}$$.

---

## 19. Mixed Content

Here's a **bold** statement with an equation $$x^2 + y^2 = 1$$ and some `code` too.

Reference @NotionManager for the equation implementation details.

See [[Developer]] for more <green>$$\text{LaTeX}$$</green> examples.

---

## 20. Real-World Examples

### Machine Learning

Loss function: $$L(\theta) = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$

Gradient descent: $$\theta := \theta - \alpha \nabla L(\theta)$$

### Physics

Wave equation:
$$
\frac{\partial^2 u}{\partial t^2} = c^2 \frac{\partial^2 u}{\partial x^2}
$$

Schrödinger equation:
$$
i\hbar\frac{\partial}{\partial t}\Psi = \hat{H}\Psi
$$

### Statistics

Standard deviation: $$\sigma = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(x_i - \mu)^2}$$

Confidence interval: $$\bar{x} \pm z \frac{\sigma}{\sqrt{n}}$$

---

## Test Summary

**Inline Equations Tested**:
- ✅ Basic: $$a^2$$, $$\frac{1}{2}$$
- ✅ Greek letters: $$\alpha$$, $$\pi$$
- ✅ Functions: $$\sin$$, $$\log$$
- ✅ Special: $$\sum$$, $$\int$$, $$\lim$$

**Block Equations Tested**:
- ✅ Single line: Quadratic formula
- ✅ Multi-line: Matrices, systems
- ✅ Complex: Normal distribution, Fourier transform

**Contexts Tested**:
- ✅ Standalone equations
- ✅ With text
- ✅ Multiple in paragraph
- ✅ With formatting (bold, colors)
- ✅ With page links

---

**Expected Rendering**:
- Inline equations render within text flow
- Block equations render centered and larger
- All LaTeX/KaTeX syntax properly formatted
