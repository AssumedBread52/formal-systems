import { ReactElement } from 'react';
import { RenderMath } from '../common/render-math/render-math';

export const Terms = (): ReactElement => {
  return (
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
  );
};
