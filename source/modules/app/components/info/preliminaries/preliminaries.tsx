import { ReactElement } from 'react';
import { RenderMath } from '../common/render-math/render-math';

export const Preliminaries = (): ReactElement => {
  return (
    <section>
      <h3>
        Preliminaries
      </h3>
      <p>
        <RenderMath inline>
          By $$\omega$$ we denote the set of all natural numbers (non-negative integers). Each natural number $$n$$ is
          identified with the set of all smaller numbers: $$n=\{'{'}m\vert m\lt n\{'}'}$$. The formula $$m\lt n$$ is thus
          equivalent to the condition: $$m\in n$$ and $$m,n\in\omega$$. In particular, $$0$$ is the number zero and at the
          same time the empty set $$\emptyset$$, $$1=\{'{'}0\{'}'}$$, $$2=\{'{'}0,1\{'}'}$$, etc. $$^BA$$ denotes the set of
          all functions on $$B$$ to $$A$$ (i.e. with domain $$B$$ and range included in $$A$$). The members of $$^\omega A$$
          are what are called <em>simple finite sequences</em>, with all <em>terms</em> in $$A$$. In case $$n\in\omega$$, the
          members of $$^nA$$ are referred to as <em>finite n-termed sequences</em>, again with terms in $$A$$. The consecutive
          terms (function values) of a finite or infinite sequence $$f$$ are denoted by $$f_0$$, $$f_1$$, $$\dots$$, $$f_n$$,
          $$\dots$$. Every finite sequence $$f\in\cup_{'{'}n\in\omega{'}'}{'{'}^n{'}'}A$$ uniquely determines the number $$n$$
          such that $$f\in{'{'}^n{'}'}A$$; $$n$$ is called the <em>length</em> of $$f$$ and is denoted by $$\vert f\vert$$.
          $$\langle a\rangle$$ is the sequence $$f$$ with $$\vert f\vert=1$$ and $$f_0=a$$; $$\langle a,b\rangle$$ is the
          sequence $$f$$ with $$\vert f\vert=2$$, $$f_0=a$$, $$f_1=b$$; etc. Given two finite sequences $$f$$ and $$g$$, we
          denote by $$f\frown g$$ their <em>concatenation</em>, i.e., the finite sequence $$h$$ determined by the conditions:
        </RenderMath>
        <RenderMath>
          \begin{'{'}split{'}'}
          \vert h\vert=\vert f\vert+\vert g\vert;&\\
          h_n=f_n&~~~~\text{'{'}for{'}'}~n\lt\vert f\vert;\\
          h_{'{'}\vert f\vert+n{'}'}=g_n&~~~~\text{'{'}for{'}'}~n\lt\vert g\vert.
          \end{'{'}split{'}'}
        </RenderMath>
      </p>
    </section>
  );
};
