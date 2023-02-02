import { Box } from '@/common/components/box/box';
import { ReactElement } from 'react';
import { RenderMath } from './render-math/render-math';

export const Info = (): ReactElement => {
  return (
    <Box mb='5rem' mt='1.5rem' mx='15%'>
      <section>
        <h2>
          The Formal Description
        </h2>
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
        <section>
          <h3>
            Constants, Variables, and Expressions
          </h3>
          <p>
            <RenderMath inline>
              A formal system has a set of <em>symbols</em> denoted by $$SM$$. A precise set-theoretical definition of this set is
              unimportant; a symbol could be considered a primitive or atomic element if we wish. We assume this set is divided
              into two disjoint subsets: a set $$CN$$ of <em>constants</em> and a set $$VR$$ of <em>variables</em>. $$CN$$ and
              $$VR$$ are each assumed to consist of countably many symbols which may be arranged in finite or simple infinite
              sequences $$c_0$$, $$c_1$$, $$\dots$$ and $$v_0$$, $$v_1$$, $$\dots$$ respectively, without repeating terms. We will
              represent arbitrary symbols by metavariables $$\alpha$$, $$\beta$$, etc.
            </RenderMath>
            <br />
            <RenderMath inline>
              Finite sequences all terms of which are symbols are called <em>expressions</em>. $$EX$$ is the set of all
              expressions; thus
            </RenderMath>
            <RenderMath>
              EX=\cup_{'{'}n\in\omega{'}'}{'{'}^n{'}'}SM.
            </RenderMath>
            <br />
            <RenderMath inline>
              A <em>constant-prefixed expression</em> is an expression of non-zero length whose first term is a constant. We
              denote the set of all constant-prefixed expressions by $$EX_C=\{'{'}e\in EX\vert(\vert e\vert\gt0\land e_0\in CN$$.
            </RenderMath>
            <br />
            <RenderMath inline>
              A <em>constant-variable pair</em> is an expression of length $$2$$ whose first term is a constant and whose second
              term is a variable. We denote the set of all constant-variable pairs by
              $$EX_2=\{'{'}e\in EX_C\vert(\vert e\vert=2\land e_1\in VR$$.
            </RenderMath>
            <br />
            <RenderMath inline>
              We denote by $$\mathcal{'{'}V{'}'}(e)$$ the set of all variables in an expression e\in EX, i.e. the set of all
              $$\alpha\in VR$$ such that $$\alpha=e_n$$ for some $$n\lt\vert e\vert$$. We also denote (with abuse of notation) by
              $$\mathcal{'{'}V{'}'}(E)$$ the set of all variables in a collection of expressions $$E\subseteq EX$$, i.e.
              $$\cup_{'{'}e\in E{'}'}\mathcal{'{'}V{'}'}(e)$$.
            </RenderMath>
          </p>
        </section>
        <section>
          <h3>
            Substitution
          </h3>
          <p>
            <RenderMath inline>
              Given a function $$F$$ from $$VR$$ to $$EX$$, we denote by $$\sigma_F$$ or just $$\sigma$$ the function from $$EX$$
              to $$EX$$ defined recursively for nonempty sequences by
            </RenderMath>
            <RenderMath>
              \begin{'{'}split{'}'}
              \sigma(\langle\alpha\rangle)=F(\alpha)~~~~&\text{'{'}for{'}'}~\alpha\in VR;\\
              \sigma(\langle\alpha\rangle)=\langle\alpha\rangle~~~~&\text{'{'}for{'}'}~\alpha\notin VR;\\
              \sigma(g\frown h)=\sigma(g)\frown\sigma(h)~~~~&\text{'{'}for{'}'}~g,h\in EX.
              \end{'{'}split{'}'}
            </RenderMath>
            <RenderMath inline>
              We also define $$\sigma(\emptyset)=\emptyset$$. We call $$\sigma$$ a <em>simultaneous substitution</em> (or just
              <em>substitution</em>) with <em>substitution map</em> $$F$$.
            </RenderMath>
            <br />
            <RenderMath inline>
              We also denote (with abuse of notation) by $$\sigma(E)$$ a substitution on a collection of expressions
              $$E\subseteq EX$$, i.e. the set $$\{'{'}\sigma(e)\vert e\in E\{'}'}$$. The collection $$\sigma(E)$$ may of course
              contain fewer expressions than $$E$$ because duplicate expressions could result from the substitution.
            </RenderMath>
          </p>
        </section>
        <section>
          <h3>
            Statements
          </h3>
          <p>
            <RenderMath inline>
              We denote by $$DV$$ the set of all unordered pairs $$\{'{'}\alpha,\beta\{'}'}\subseteq VR$$ such that
              $$\alpha\neq\beta$$. $$DV$$ stands for "distinct variables."
            </RenderMath>
            <br />
            <RenderMath inline>
              A <em>pre-statement</em> is a quadruple $$\langle D,T,H,A\rangle$$ such that $$D\subseteq DV$$, $$T\subseteq EX_2$$,
              $$H\subseteq EX_C$$ and $$H$$ is finite, $$A\in EX_C$$,
              $$\mathcal{'{'}V{'}'}(H\cup\{'{'}A\{'}'})\subseteq\mathcal{'{'}V{'}'}(T)$$, and
              $$\forall e,f\in T~\mathcal{'{'}V{'}'}(e)\neq\mathcal{'{'}V{'}'}(f)$$ (or equivalently, $$e_1\neq f_1$$) whenever
              $$e\neq f$$. The terms of the quadruple are called <em>distinct-variables restrictions</em>,
              <em>variable-type hypotheses</em>, <em>logical hyypotheses</em>, and the <em>assertion</em> respectively. We denote
              by $$T_M$$ (mandatory <em>variable-type hypotheses</em>) the subset of $$T$$ such that
              $$\mathcal{'{'}V{'}'}(T_M)=\mathcal{'{'}V{'}'}(H\cup\{'{'}A\{'}'})$$. We denote by
              $$D_M=\{'{'}\{'{'}\alpha,\beta\{'}'}\in D\vert\{'{'}\alpha,\beta\{'}'}\subseteq\mathcal{'{'}V{'}'}(T_M)\{'}'}$$ the
              <em>mandatory distinct-variable restrictions</em> of the pre-statement. The set of <em>mandatory hypotheses</em> is
              $$T_M\cup H$$. We call the quadruple $$\langle D_M,T_M,H,A\rangle$$ the <em>reduct</em> of the pre-statement
              $$\langle D,T,H,A\rangle$$.
            </RenderMath>
            <br />
            <RenderMath inline>
              A <em>statement</em> is the reduct of some pre-statement. A statement is therefore a special kind of pre-statement;
              in particular, a statement is the reduct of itself.
            </RenderMath>
          </p>
        </section>
        <section>
          <h3>
            Formal Systems
          </h3>
          <p>
            <RenderMath inline>
              A <em>formal system</em> is a triple $$\langle CN,VR,\Gamma\rangle$$ where $$\Gamma$$ is a set of statements. The
              members of $$\Gamma$$ are called <em>axiomatic statements</em>. Sometimes we will refer to a formal system by just
              $$\Gamma$$ when $$CN$$ and $$VR$$ are understood.
            </RenderMath>
            <br />
            <RenderMath inline>
              Given a formal system $$\Gamma$$, the <em>closure</em> of a pre-statement $$\langle D,T,H,A\rangle$$ is the smallest
              set $$C$$ of expressions such that:
            </RenderMath>
            <RenderMath>
              \begin{'{'}split{'}'}
              1.&T\cup H\subseteq C;~\text{'{'}and{'}'}\\
              2.&\text{'{'}If for some axiomatic statement{'}'}~\langle D_M',T_M',H',A'\rangle\in\Gamma~\text{'{'}and for some substitution{'}'}~\sigma~\text{'{'}we have{'}'}\\
              &a.~\sigma(T_M'\cup H')\subseteq C;~\text{'{'}and{'}'}\\
              &b.~\text{'{'}for all{'}'}~\{'{'}\alpha,\beta\{'}'}\in D_M',~\text{'{'}for all{'}'}~\gamma\in\mathcal{'{'}V{'}'}(\sigma(\langle\alpha\rangle)),~\text{'{'}and for all{'}'}~\delta\in\mathcal{'{'}V{'}'}(\sigma(\langle\beta\rangle)),~\text{'{'}we have{'}'}~\{'{'}\gamma,\delta\{'}'}\in D;\\
              &\text{'{'}then{'}'}~\sigma(A')\in C.
              \end{'{'}split{'}'}
            </RenderMath>
            <br />
            <RenderMath inline>
              A pre-statement $$\langle D,T,H,A\rangle$$ is <em>provable</em> if $$A\in C$$ i.e. if its assertion belongs to its
              closure. A statement is <em>provable</em> if it is the reduct of a provable pre-statement. The <em>universe</em> of
              a formal system is the collection of all of its provable statements. Note that the set of axiomatic statements
              $$\Gamma$$ in a formal system is a subset of its universe.
            </RenderMath>
          </p>
        </section>
      </section>
    </Box>
  );
};
