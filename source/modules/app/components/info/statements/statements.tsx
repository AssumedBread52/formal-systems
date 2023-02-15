import { ReactElement } from 'react';
import { RenderMath } from '../common/render-math/render-math';

export const Statements = (): ReactElement => {
  return (
    <section>
      <h3>
        Statements
      </h3>
      <p>
        Distinct variables are unordered pairs of variable symbols that are not the same symbol.
        <RenderMath content='DV=\{\{\alpha,\beta\}\subseteq VR::\alpha\neq\beta\}' />
        A pre-statement is a quadruple of distinct variable restrictions, variable type hypotheses, logical hypotheses, and an
        assertion.
        <RenderMath content='\langle D,T,H,A\rangle' />
        Distinct variable restrictions must be a subset of the distinct variables.
        <RenderMath content='D\subseteq DV' />
        Variable type hypotheses are constant variable pairs and may not assign a variable symbol more than one type. Variable
        type hypotheses must have a hypothesis for each variable symbol that appears in the set of logical hypotheses and the
        assertion.
        <RenderMath content='T\subseteq EX_2' />
        <RenderMath content='\forall e,f\in T(e\neq f\to e_1\neq f_1)' />
        <RenderMath content='\mathcal{V}(H\cup\{A\})\subseteq\mathcal{V}(T)' />
        Logical hypotheses are constant prefixed expressions. The set of logical hypotheses is finite.
        <RenderMath content='H\subseteq EX_C' />
        <RenderMath content='\vert H\vert\in\omega' />
        The assertion is a constant prefixed expression.
        <RenderMath content='A\in EX_C' />
        The set of mandatory variable type hypotheses have a variable type hypothesis only for the variable symbols that appear
        in the logical hypotheses and the assertion.
        <RenderMath content='\mathcal{V}(T_M)=\mathcal{V}(H\cup\{A\})' />
        Similary, the set of mandatory distinct variable restrictions only include restrictions where both variable symbols
        appear in the set of mandatory variable type hypotheses.
        <RenderMath content='D_M=\{\{\alpha,\beta\}\in D::\{\alpha,\beta\}\subseteq\mathcal{V}(T_M)\}' />
        The set of mandatory hypotheses is the set of mandatory variable type hypotheses and the logical hypotheses.
        <RenderMath content='T_M\cup H' />
        The reduct of the pre-statement is constructed when the distinct variable restrictions and variable type hypotheses are
        replaced with the mandatory distinct variable restrictions and the mandatory variable type hypotheses, respectively.
        <RenderMath content='\langle D_M,T_M,H,A\rangle' />
        A statement is the reduct of some pre-statement and can be thought of as the reduct of itself.
      </p>
    </section>
  );
};
