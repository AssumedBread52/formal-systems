import { AntdCard } from '@/common/components/antd-card/antd-card';
import { AntdSpace } from '@/common/components/antd-space/antd-space';
import { RenderMath } from '@/common/components/render-math/render-math';
import { ReactElement } from 'react';

export const Info = (): ReactElement => {
  return (
    <AntdCard title='The Formal Description'>
      <AntdSpace direction='vertical' size='large'>
        <AntdCard title='Preliminaries' type='inner'>
          The set of all natural numbers, or non-negative integers, are the positive whole numbers including zero.
          <RenderMath content='\omega=\mathbb{N}=\mathbb{Z}^+=\{0,1,2,\dots\}' />
          Each natural number can be defined as a set containing all natural numbers less than itself.
          <RenderMath content='\forall n\in\omega(n=\{m\in\omega::m\lt n\})' />
          We can group functions with the same domain that are surjective to a codomain into a set.
          <RenderMath content='^BA=\{f::\exists C\subseteq A(f:B\to C)\}' />
          Using natural numbers as sets, simple finite sequences can be thought of as surjective functions with a domain of
          their length and codomain of any set which contains the symbols appearing in the sequence. Infinite sequences are
          similar except their domain is the set of natural numbers rather than any individual natural number. Each term in the
          sequence can be referenced by its zero-based index. Angle brackets wrap terms to show sequences.
          <RenderMath content='\forall n\in\omega(f\in{^n}A\to(\vert f\vert=n\land f=\langle f_0,f_1,\dots,f_n\rangle))' />
          <RenderMath content='f\in{^\omega}A\to f=\langle f_0,f_1,\dots\rangle' />
          Two finite sequences can be concatenated into a single finite sequence.
          <RenderMath content='h=f\frown g' />
          The length of the concatenated sequence is the sum of the lengths of the operands.
          <RenderMath content='\vert h\vert=\vert f\vert+\vert g\vert' />
          The order of terms are determined by the order of the operands.
          <RenderMath content='h_n=\begin{cases}f_n&0\le n\lt\vert f\vert\\g_{n-\vert f\vert}&\vert f\vert\le n\lt\vert f\vert+\vert g\vert\end{cases}' />
        </AntdCard>
        <AntdCard title='Constants, Variables, and Expressions' type='inner'>
          A formal system is constructed over a finite set of symbols. This set can be divided into a pair of disjoint subsets:
          a set of constant symbols and variable symbols. This means every symbol in the formal system is either a constant
          symbol or a variable symbol but not both.
          <RenderMath content='SM=CN\cup VR' />
          <RenderMath content='CN\cap VR=\emptyset' />
          Arbitrary symbol variables will be represented by metavariables.
          <RenderMath content='\alpha,\beta,\dots' />
          An expression is a finite sequence of symbols.
          <RenderMath content='EX=\bigcup_{n\in\omega}{^n}SM' />
          A constant prefixed expression is an expression of non-zero length whose first term is a constant symbol.
          <RenderMath content='EX_C=\{e\in EX::\vert e\vert\gt0\land e_0\in CN\}' />
          A constant variable pair is an expression of length two whose first term is a constant symbol and whose second term is
          a variable symbol.
          <RenderMath content='EX_2=\{e\in EX_C::\vert e\vert=2\land e_1\in VR\}' />
          From every expression we can construct a set containing all the variable symbols that appear in the expression.
          <RenderMath content='\mathcal{V}:EX\to\mathcal{P}(VR)' />
          <RenderMath content='\mathcal{V}(e)=\{\alpha\in VR::\exists n(\alpha=e_n)\}' />
          For the sake of brevity sometimes we will apply this function to a set of expressions.
          <RenderMath content='\mathcal{V}:\mathcal{P}(EX)\to\mathcal{P}(VR)' />
          <RenderMath content='\mathcal{V}(E)=\bigcup_{e\in E}\mathcal{V}(e)' />
        </AntdCard>
        <AntdCard title='Substitution' type='inner'>
          A substitution map is a function which maps from the set of variable symbols to the set of expressions.
          <RenderMath content='F:VR\to EX' />
          A simultaneous substitution is a function which maps expressions to expressions using a substitution map.
          <RenderMath content='\sigma_F:EX\to EX' />
          The simultaneous substitution for expressions of length one are performed using the substitution map.
          <RenderMath content='\sigma_F(\langle\alpha\rangle)=\begin{cases}\langle F(\alpha)\rangle&\alpha\in VR\\\langle\alpha\rangle&\alpha\notin VR\end{cases}' />
          Expressions longer than length one are recursively computed.
          <RenderMath content='\sigma_F(g\frown h)=\sigma_F(g)\frown\sigma_F(h)' />
          For the sake of brevity sometimes we will apply a simultaneous substitution to a set of expressions.
          <RenderMath content='\sigma_F:\mathcal{P}(EX)\to\mathcal{P}(EX)' />
          <RenderMath content='\sigma_F(E)=\{\sigma_F(e)::e\in E\}' />
        </AntdCard>
        <AntdCard title='Statements' type='inner'>
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
          The set of mandatory variable type hypotheses have a variable type hypothesis only for the variable symbols that
          appear in the logical hypotheses and the assertion.
          <RenderMath content='\mathcal{V}(T_M)=\mathcal{V}(H\cup\{A\})' />
          Similarly, the set of mandatory distinct variable restrictions only include restrictions where both variable symbols
          appear in the set of mandatory variable type hypotheses.
          <RenderMath content='D_M=\{\{\alpha,\beta\}\in D::\{\alpha,\beta\}\subseteq\mathcal{V}(T_M)\}' />
          The set of mandatory hypotheses is the set of mandatory variable type hypotheses and the logical hypotheses.
          <RenderMath content='T_M\cup H' />
          The reduct of the pre-statement is constructed when the distinct variable restrictions and variable type hypotheses
          are replaced with the mandatory distinct variable restrictions and the mandatory variable type hypotheses,
          respectively.
          <RenderMath content='\langle D_M,T_M,H,A\rangle' />
          A statement is the reduct of some pre-statement and can be thought of as the reduct of itself.
        </AntdCard>
        <AntdCard title='Formal Systems' type='inner'>
          A formal system is a triple of a constant symbols set, a variable symbols set, and axiomatic statements set. If the
          symbol sets are understood, then the formal system can be identified only by its axiomatic statements.
          <RenderMath content='\langle CN,VR,\Gamma\rangle' />
          The closure of a pre-statement is constructed in the context of a given formal system. The closure of a pre-statement
          begins with its hypotheses.
          <RenderMath content='T\cup H\subseteq C' />
          Expressions are added to the closure by first selecting an axiomatic statement and an appropriate substitution map.
          <RenderMath content='\langle D_M^\prime,T_M^\prime,H^\prime,A^\prime\rangle\in\Gamma' />
          <RenderMath content='F:\mathcal{V}(T_M^\prime)\to EX' />
          There are two conditions which must be met: 1. the simultaneously substituted hypotheses of the axiomatic statement
          must already be in the closure and 2. there cannot be any distinct variable restriction violations.
          <RenderMath content='\begin{aligned}1.~&\sigma_F(T_M^\prime\cup H^\prime)\subseteq C\\2.~&\forall\{\alpha,\beta\}\in D_M^\prime(\forall\gamma\in\sigma_F(\langle\alpha\rangle),\delta\in\sigma_F(\langle\beta\rangle)(\{\gamma,\delta\}\in D))\end{aligned}' />
          If the conditions are met, then the simultaneously substituted assertion belongs to the closure.
          <RenderMath content='\sigma_F(A^\prime)\in C' />
          If the closure of a pre-statement contains its assertion, then the pre-statement is said to be provable. A provable
          statement is the reduct of a provable pre-statement. The universe of a formal system is the set of all provable
          statements. The axiomatic statements of a formal system are a subset of the universe of the formal system.
        </AntdCard>
      </AntdSpace>
    </AntdCard>
  );
};
