import { ReactElement } from 'react';
import { RenderMath } from '../common/render-math/render-math';

export const Statements = (): ReactElement => {
  return (
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
  );
};
