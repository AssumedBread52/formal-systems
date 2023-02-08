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
          We denote by $$DV$$ the set of distinct variables, or all unordered pairs $$\{'{'}\alpha,\beta\{'}'}\subseteq VR$$
          such that $$\alpha\neq\beta$$.
        </RenderMath>
        <br />
        <br />
        <RenderMath inline>
          A pre-statement is a quadruple $$\langle D,T,H,A\rangle$$ such that $$D\subseteq DV$$, $$T\subseteq EX_2$$,
          $$H\subseteq EX_C$$, $$H$$ is finite, $$A\in EX_C$$,
          $$\mathcal{'{'}V{'}'}(H\cup\{'{'}A\{'}'})\subseteq\mathcal{'{'}V{'}'}(T)$$, and
          $$\forall e,f\in T~\mathcal{'{'}V{'}'}(e)\neq\mathcal{'{'}V{'}'}(f)$$ (or equivalently, $$e_1\neq f_1$$) whenever
          $$e\neq f$$. The terms of the quadruple are called distinct-variables restrictions, variable-type hypotheses, logical
          hypotheses, and the assertion, respectively. We denote by $$T_M$$ the mandatory variable-type hypotheses which is the
          subset of $$T$$ such that $$\mathcal{'{'}V{'}'}(T_M)=\mathcal{'{'}V{'}'}(H\cup\{'{'}A\{'}'})$$. We denote by
          $$D_M=\{'{'}\{'{'}\alpha,\beta\{'}'}\in D\vert\{'{'}\alpha,\beta\{'}'}\subseteq\mathcal{'{'}V{'}'}(T_M)\{'}'}$$ the
          mandatory distinct-variable restrictions of the pre-statement. The set of mandatory hypotheses is $$T_M\cup H$$. We
          call the quadruple $$\langle D_M,T_M,H,A\rangle$$ the reduct of the pre-statement $$\langle D,T,H,A\rangle$$.
        </RenderMath>
        <br />
        <br />
        A statement is the reduct of some pre-statement. A statement is therefore a special kind of pre-statement; in
        particular, a statement is the reduct of itself.
      </p>
    </section>
  );
};
