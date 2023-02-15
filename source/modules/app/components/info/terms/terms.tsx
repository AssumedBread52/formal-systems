import { ReactElement } from 'react';
import { RenderMath } from '../common/render-math/render-math';

export const Terms = (): ReactElement => {
  return (
    <section>
      <h3>
        Constants, Variables, and Expressions
      </h3>
      <p>
        A formal system is constructed over a finite set of symbols. This set can be divided into a pair of disjoint subsets: a
        set of constant symbols and variable symbols. This means every symbol in the formal system is either a constant symbol
        or a variable symbol but not both.
        <RenderMath content='SM=CN\cup VR' />
        <RenderMath content='CN\cap VR=\emptyset' />
        Arbitrary symbol variables will be represented by metavariables.
        <RenderMath content='\alpha,\beta,\dots' />
        An expression is a finite sequence of symbols.
        <RenderMath content='EX=\bigcup_{n\in\omega}{^n}SM' />
        A constant prefixed expression is an expression of non-zero length whose first term is a constant symbol.
        <RenderMath content='EX_C=\{e\in EX::\vert e\vert\gt0\land e_0\in CN\}' />
        A constant variable pair is an expression of length two whose first term is a constant symbol and whose second term is a
        variable symbol.
        <RenderMath content='EX_2=\{e\in EX_C::\vert e\vert=2\land e_1\in VR\}' />
        From every expression we can construct a set containing all the variable symbols that appear in the expression.
        <RenderMath content='\mathcal{V}:EX\to\mathcal{P}(VR)' />
        <RenderMath content='\mathcal{V}(e)=\{\alpha\in VR::\exists n(\alpha=e_n)\}' />
        For the sake of brevity sometimes we will apply this function to a set of expressions.
        <RenderMath content='\mathcal{V}:\mathcal{P}(EX)\to\mathcal{P}(VR)' />
        <RenderMath content='\mathcal{V}(E)=\bigcup_{e\in E}\mathcal{V}(e)' />
      </p>
    </section>
  );
};
