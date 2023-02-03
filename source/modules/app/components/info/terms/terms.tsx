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
          A formal system has a set of symbols denoted by $$SM$$. A precise set-theoretical definition of this set is
          unimportant; a symbol could be considered a primitive or atomic element if we wish. We assume this set is divided
          into two disjoint subsets: a set $$CN$$ of constant symbols and a set $$VR$$ of variable symbols. $$CN$$ and $$VR$$
          are each assumed to consist of countably many symbols which may be arranged in finite or simple infinite sequences
          $$c_0$$, $$c_1$$, $$\dots$$ and $$v_0$$, $$v_1$$, $$\dots$$ respectively, without repeating terms. We will represent
          arbitrary symbols by metavariables $$\alpha$$, $$\beta$$, etc.
        </RenderMath>
        <br />
        <br />
        <RenderMath inline>
          Finite sequences all terms of which are symbols are called expressions. $$EX$$ is the set of all expressions; thus
        </RenderMath>
        <RenderMath>
          EX=\bigcup_{'{'}n\in\omega{'}'}{'{'}^n{'}'}SM
        </RenderMath>
        A constant-prefixed expression is an expression of non-zero length whose first term is a constant. We denote the set of
        all constant-prefixed expressions by
        <RenderMath>
          EX_C=\{'{'}e\in EX:\vert e\vert\gt0\land e_0\in CN\{'}'}
        </RenderMath>
        A constant-variable pair is an expression of length two whose first term is a constant symbol and whose second term is a
        variable symbol. We denote the set of all constant-variable pairs by
        <RenderMath>
          EX_2=\{'{'}e\in EX_C:\vert e\vert=2\land e_1\in VR\{'}'}
        </RenderMath>
        <RenderMath inline>
          We denote by $$\mathcal{'{'}V{'}'}(e)$$ the set of all variables in a given expression.
        </RenderMath>
        <RenderMath>
          \mathcal{'{'}V{'}'}(e)=\{'{'}\alpha\in VR:\exists n(\alpha=e_n)\{'}'}
        </RenderMath>
        <RenderMath inline>
          We also denote (with abuse of notation) by $$\mathcal{'{'}V{'}'}(E)$$ the set of all variables in a collection of
          expressions $$E\subseteq EX$$.
        </RenderMath>
        <RenderMath>
          \mathcal{'{'}V{'}'}(E)=\bigcup_{'{'}e\in E{'}'}\mathcal{'{'}V{'}'}(e)
        </RenderMath>
      </p>
    </section>
  );
};
