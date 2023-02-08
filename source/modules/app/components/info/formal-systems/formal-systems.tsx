import { ReactElement } from 'react';
import { RenderMath } from '../common/render-math/render-math';

export const FormalSystems = (): ReactElement => {
  return (
    <section>
      <h3>
        Formal Systems
      </h3>
      <p>
        <RenderMath inline>
          A formal system is a triple $$\langle CN,VR,\Gamma\rangle$$ where $$\Gamma$$ is a set of statements. The members of
          $$\Gamma$$ are called axiomatic statements. Sometimes a formal system is referred to by just $$\Gamma$$ when $$CN$$
          and $$VR$$ are understood.
        </RenderMath>
        <br />
        <br />
        <RenderMath inline>
          Given a formal system, the closure of a pre-statement $$\langle D,T,H,A\rangle$$ is the smallest set $$C$$ of
          expressions such that:
        </RenderMath>
        <RenderMath>
          \begin{'{'}split{'}'}
          1.&T\cup H\subseteq C;~\text{'{'}and{'}'}\\
          {'2.&\\text{If for some axiomatic statement}~\\langle D_M\',T_M\',H\',A\'\\rangle\\in\\Gamma~\\text{and for some substitution}~\\sigma~\\text{we have}\\\\'}
          {'&a.~\\sigma(T_M\'\\cup H\')\\subseteq C;~\\text{and}\\\\'}
          {'&b.~\\text{for all}~\\{\\alpha,\\beta\\}\\in D_M\',~\\text{for all}~\\gamma\\in\\mathcal{V}(\\sigma(\\langle\\alpha\\rangle)),~\\text{and for all}~\\delta\\in\\mathcal{V}(\\sigma(\\langle\\beta\\rangle)),~\\text{we have}~\\{\\gamma,\\delta\\}\\in D;\\\\'}
          {'&\\text{then}~\\sigma(A\')\\in C.'}
          \end{'{'}split{'}'}
        </RenderMath>
        <br />
        <RenderMath inline>
          A pre-statement $$\langle D,T,H,A\rangle$$ is provable if its assertion belongs to its closure, $$A\in C$$. A
          statement is provable if it is the reduct of a provable pre-statement. The universe of a formal system is the
          collection of all of its provable statements. Note that the set of axiomatic statements $$\Gamma$$ is a subset of its
          universe.
        </RenderMath>
      </p>
    </section>
  );
};
