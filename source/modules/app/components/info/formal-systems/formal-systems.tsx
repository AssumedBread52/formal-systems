import { ReactElement } from 'react';
import { RenderMath } from '../common/render-math/render-math';

export const FormalSystems = (): ReactElement => {
  return (
    <section>
      <h3>
        Formal Systems
      </h3>
      <p>
        A formal system is a triple of a constant symbols set, a variable symbols set, and axiomatic statements set. If the
        symbol sets are understood the formal system can be identified only by its axiomatic statements.
        <RenderMath content='\langle CN,VR,\Gamma\rangle' />
        The closure of a pre-statement is constructed in the context of a given formal system. The closure of a pre-statement
        begins with its hypotheses.
        <RenderMath content='T\cup H\subseteq C' />
        Expressions are added to the closure by first selecting an axiomatic statement and appropriate substitution map.
        <RenderMath content='\langle D_M^\prime,T_M^\prime,H^\prime,A^\prime\rangle\in\Gamma' />
        <RenderMath content='F:\mathcal{V}(T_M^\prime)\to EX' />
        There are two conditions which must be met: 1. the simultaneously substitution hypotheses of the axiomatic statement
        must already be in the closure and 2. there cannot be any distinct variable restriction violations.
        <RenderMath>
          \begin{'{'}aligned{'}'}
          1.~&\sigma_F(T_M^\prime\cup H^\prime)\subseteq C\\
          2.~&\forall\{'{'}\alpha,\beta\{'}'}\in D_M^\prime(\forall\gamma\in\sigma_F(\langle\alpha\rangle),\delta\in\sigma_F(\langle\beta\rangle)(\{'{'}\gamma,\delta\{'}'}\in D))
          \end{'{'}aligned{'}'}
        </RenderMath>
        If the conditions are met, then the simultaneously substituted assertion belongs to the closure.
        <RenderMath content='\sigma_F(A^\prime)\in C' />
        If the closure of a pre-statement contains its assertion, then the pre-statement is said to be provable. A provable
        statement is the reduct of a provable pre-statement. The universe of a formal system is the set of all provable
        statements. The axiomatic statements of a formal system are a subset of the universe of the formal system.
      </p>
    </section>
  );
};
